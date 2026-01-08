import { Hono } from "hono";
import { generateDPoPKeyPair } from "../lib/dpop";
import {
	fetchOAuthMetadata,
	generatePKCE,
	generateState,
	sendPAR,
	buildAuthorizationUrl,
	exchangeCodeForTokens,
} from "../lib/oauth";
import {
	storeAuthState,
	getAndDeleteAuthState,
	createSession,
	getSession,
	deleteSession,
	getSessionIdFromCookie,
	setSessionCookie,
	clearSessionCookie,
	isTokenExpired,
	updateSession,
} from "../lib/session";
import { refreshAccessToken } from "../lib/oauth";

interface Env {
	SESSIONS: KVNamespace;
	ALLOWED_DID: string;
	PDS_URL: string;
	CLIENT_URL: string;
	API_URL: string;
}

const auth = new Hono<{ Bindings: Env }>();

// OAuth client metadata endpoint
auth.get("/client-metadata.json", (c) => {
	const clientId = `${c.env.API_URL}/auth/client-metadata.json`;
	const redirectUri = `${c.env.API_URL}/auth/callback`;

	return c.json({
		client_id: clientId,
		client_name: "Steve Dylan's Blog",
		client_uri: c.env.API_URL,
		redirect_uris: [redirectUri],
		grant_types: ["authorization_code", "refresh_token"],
		response_types: ["code"],
		scope: "atproto transition:generic",
		token_endpoint_auth_method: "none",
		application_type: "web",
		dpop_bound_access_tokens: true,
	});
});

// Start OAuth login flow
auth.get("/login", async (c) => {
	try {
		const clientId = `${c.env.API_URL}/auth/client-metadata.json`;
		const redirectUri = `${c.env.API_URL}/auth/callback`;

		// Fetch OAuth metadata from PDS
		const metadata = await fetchOAuthMetadata(c.env.PDS_URL);

		// Generate PKCE and state
		const pkce = await generatePKCE();
		const state = generateState();

		// Generate DPoP keypair
		const dpopKeyPair = await generateDPoPKeyPair();

		// Send PAR request
		const { parResponse, dpopNonce } = await sendPAR(
			metadata,
			clientId,
			redirectUri,
			state,
			pkce,
			dpopKeyPair,
			"atproto transition:generic",
		);

		// Store auth state in KV
		await storeAuthState(
			c.env.SESSIONS,
			state,
			pkce.codeVerifier,
			dpopKeyPair,
			dpopNonce,
		);

		// Build authorization URL and redirect
		const authUrl = buildAuthorizationUrl(
			metadata,
			parResponse.request_uri,
			clientId,
		);
		return c.redirect(authUrl);
	} catch (error) {
		console.error("Login error:", error);
		return c.redirect(`${c.env.CLIENT_URL}/now?error=login_failed`);
	}
});

// OAuth callback handler
auth.get("/callback", async (c) => {
	try {
		const code = c.req.query("code");
		const state = c.req.query("state");
		const error = c.req.query("error");
		const errorDescription = c.req.query("error_description");

		// Handle OAuth errors
		if (error) {
			console.error("OAuth error:", error, errorDescription);
			return c.redirect(
				`${c.env.CLIENT_URL}/now?error=${encodeURIComponent(error)}`,
			);
		}

		if (!code || !state) {
			return c.redirect(`${c.env.CLIENT_URL}/now?error=missing_params`);
		}

		// Retrieve and validate auth state
		const authState = await getAndDeleteAuthState(c.env.SESSIONS, state);
		if (!authState) {
			return c.redirect(`${c.env.CLIENT_URL}/now?error=invalid_state`);
		}

		const clientId = `${c.env.API_URL}/auth/client-metadata.json`;
		const redirectUri = `${c.env.API_URL}/auth/callback`;

		// Fetch OAuth metadata
		const metadata = await fetchOAuthMetadata(c.env.PDS_URL);

		// Exchange code for tokens
		const { tokenResponse, dpopNonce } = await exchangeCodeForTokens(
			metadata,
			code,
			authState.codeVerifier,
			clientId,
			redirectUri,
			authState.dpopKeyPair,
			authState.dpopNonce,
		);

		// CRITICAL: Only allow the site owner
		if (tokenResponse.sub !== c.env.ALLOWED_DID) {
			console.error("Unauthorized login attempt from:", tokenResponse.sub);
			return c.redirect(`${c.env.CLIENT_URL}/now?error=unauthorized`);
		}

		// Create session
		const sessionId = await createSession(
			c.env.SESSIONS,
			tokenResponse.access_token,
			tokenResponse.refresh_token || "",
			authState.dpopKeyPair,
			dpopNonce,
			tokenResponse.sub,
			tokenResponse.expires_in,
		);

		// Set session cookie and redirect to /now
		setSessionCookie(c, sessionId, c.env.CLIENT_URL);
		return c.redirect(`${c.env.CLIENT_URL}/now/post`);
	} catch (error) {
		console.error("Callback error:", error);
		return c.redirect(`${c.env.CLIENT_URL}/now?error=callback_failed`);
	}
});

// Logout endpoint
auth.post("/logout", async (c) => {
	const sessionId = getSessionIdFromCookie(c);

	if (sessionId) {
		await deleteSession(c.env.SESSIONS, sessionId);
	}

	clearSessionCookie(c, c.env.CLIENT_URL);

	return c.json({ success: true });
});

// Check auth status
auth.get("/status", async (c) => {
	const sessionId = getSessionIdFromCookie(c);

	if (!sessionId) {
		return c.json({ authenticated: false });
	}

	const sessionData = await getSession(c.env.SESSIONS, sessionId);
	if (!sessionData) {
		clearSessionCookie(c, c.env.CLIENT_URL);
		return c.json({ authenticated: false });
	}

	const { session, dpopKeyPair } = sessionData;

	// Check if token needs refresh
	if (isTokenExpired(session.expiresAt) && session.refreshToken) {
		try {
			const metadata = await fetchOAuthMetadata(c.env.PDS_URL);
			const clientId = `${c.env.API_URL}/auth/client-metadata.json`;

			const { tokenResponse, dpopNonce } = await refreshAccessToken(
				metadata,
				session.refreshToken,
				clientId,
				dpopKeyPair,
				session.dpopNonce,
			);

			// Update session with new tokens
			await updateSession(
				c.env.SESSIONS,
				sessionId,
				tokenResponse.access_token,
				tokenResponse.refresh_token || session.refreshToken,
				dpopNonce,
				tokenResponse.expires_in,
			);

			return c.json({
				authenticated: true,
				did: session.did,
				handle: session.handle,
			});
		} catch (error) {
			console.error("Token refresh failed:", error);
			await deleteSession(c.env.SESSIONS, sessionId);
			clearSessionCookie(c, c.env.CLIENT_URL);
			return c.json({ authenticated: false });
		}
	}

	return c.json({
		authenticated: true,
		did: session.did,
		handle: session.handle,
	});
});

export default auth;
