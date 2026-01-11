import { Hono } from "hono";
import {
	fetchOAuthMetadata,
	refreshAccessToken,
	initiateOAuthFlow,
	completeOAuthFlow,
} from "../lib/oauth";
import {
	createSession,
	getSession,
	deleteSession,
	getSessionIdFromCookie,
	setSessionCookie,
	clearSessionCookie,
	isTokenExpired,
	updateSession,
} from "../lib/session";

interface Env {
	SESSIONS: KVNamespace;
	ALLOWED_DID: string;
	PDS_URL: string;
	CLIENT_URL: string;
	API_URL: string;
}

const guestAuth = new Hono<{ Bindings: Env }>();

// OAuth client metadata endpoint for guests
guestAuth.get("/client-metadata.json", (c) => {
	const clientId = `${c.env.API_URL}/guest-auth/client-metadata.json`;
	const redirectUri = `${c.env.API_URL}/guest-auth/callback`;

	return c.json({
		client_id: clientId,
		client_name: "Steve Dylan's Blog (Guest)",
		client_uri: c.env.API_URL,
		redirect_uris: [redirectUri],
		grant_types: ["authorization_code", "refresh_token"],
		response_types: ["code"],
		scope: "atproto repo:site.standard.document.comment?action=create",
		token_endpoint_auth_method: "none",
		application_type: "web",
		dpop_bound_access_tokens: true,
	});
});

// Resolve handle to PDS URL
async function resolveHandleToPDS(handle: string): Promise<string> {
	// First, resolve the handle to a DID
	let did: string;

	if (handle.startsWith("did:")) {
		did = handle;
	} else {
		// Try to resolve handle via Bluesky API
		const resolveUrl = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`;
		const resolveResponse = await fetch(resolveUrl);
		if (!resolveResponse.ok) {
			throw new Error("Could not resolve handle");
		}
		const resolveData = (await resolveResponse.json()) as { did: string };
		did = resolveData.did;
	}

	// Now resolve the DID to get the PDS URL from the DID document
	let pdsUrl: string | undefined;

	if (did.startsWith("did:plc:")) {
		// Fetch DID document from plc.directory
		const didDocUrl = `https://plc.directory/${did}`;
		const didDocResponse = await fetch(didDocUrl);
		if (!didDocResponse.ok) {
			throw new Error("Could not fetch DID document");
		}
		const didDoc = (await didDocResponse.json()) as {
			service?: Array<{ id: string; type: string; serviceEndpoint: string }>;
		};

		// Find the PDS service endpoint
		const pdsService = didDoc.service?.find(
			(s) => s.id === "#atproto_pds" || s.type === "AtprotoPersonalDataServer",
		);
		pdsUrl = pdsService?.serviceEndpoint;
	} else if (did.startsWith("did:web:")) {
		// For did:web, fetch the DID document from the domain
		const domain = did.replace("did:web:", "");
		const didDocUrl = `https://${domain}/.well-known/did.json`;
		const didDocResponse = await fetch(didDocUrl);
		if (!didDocResponse.ok) {
			throw new Error("Could not fetch DID document");
		}
		const didDoc = (await didDocResponse.json()) as {
			service?: Array<{ id: string; type: string; serviceEndpoint: string }>;
		};

		const pdsService = didDoc.service?.find(
			(s) => s.id === "#atproto_pds" || s.type === "AtprotoPersonalDataServer",
		);
		pdsUrl = pdsService?.serviceEndpoint;
	}

	if (!pdsUrl) {
		throw new Error("Could not find PDS URL for user");
	}

	return pdsUrl;
}

// Start OAuth login flow for guests
guestAuth.get("/login", async (c) => {
	try {
		const clientId = `${c.env.API_URL}/guest-auth/client-metadata.json`;
		const redirectUri = `${c.env.API_URL}/guest-auth/callback`;

		// Get handle from query params (required for guests)
		const handle = c.req.query("handle");
		const returnTo = c.req.query("returnTo") || "/now";

		if (!handle) {
			return c.redirect(`${c.env.CLIENT_URL}/now?error=handle_required`);
		}

		// Resolve handle to their PDS
		let pdsUrl: string;
		try {
			pdsUrl = await resolveHandleToPDS(handle);
		} catch (err) {
			console.error("Failed to resolve handle:", err);
			return c.redirect(`${c.env.CLIENT_URL}/now?error=invalid_handle`);
		}

		const { authUrl, state } = await initiateOAuthFlow(c.env.SESSIONS, {
			pdsUrl,
			clientId,
			redirectUri,
			scope: "atproto repo:site.standard.document.comment?action=create",
		});

		// Store returnTo and pdsUrl separately to retrieve after callback
		await c.env.SESSIONS.put(
			`guest_return:${state}`,
			returnTo,
			{ expirationTtl: 600 }, // 10 minutes
		);
		await c.env.SESSIONS.put(
			`guest_pds:${state}`,
			pdsUrl,
			{ expirationTtl: 600 }, // 10 minutes
		);

		return c.redirect(authUrl);
	} catch (error) {
		console.error("Guest login error:", error);
		return c.redirect(`${c.env.CLIENT_URL}/now?error=login_failed`);
	}
});

// OAuth callback handler for guests
guestAuth.get("/callback", async (c) => {
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

		// Get return URL and PDS URL
		const returnTo =
			(await c.env.SESSIONS.get(`guest_return:${state}`)) || "/now";
		const pdsUrl = await c.env.SESSIONS.get(`guest_pds:${state}`);
		await c.env.SESSIONS.delete(`guest_return:${state}`);
		await c.env.SESSIONS.delete(`guest_pds:${state}`);

		if (!pdsUrl) {
			return c.redirect(`${c.env.CLIENT_URL}/now?error=missing_pds`);
		}

		const clientId = `${c.env.API_URL}/guest-auth/client-metadata.json`;
		const redirectUri = `${c.env.API_URL}/guest-auth/callback`;

		const oauthResult = await completeOAuthFlow(
			c.env.SESSIONS,
			pdsUrl,
			code,
			state,
			clientId,
			redirectUri,
		);

		if (!oauthResult) {
			return c.redirect(`${c.env.CLIENT_URL}/now?error=invalid_state`);
		}

		const { tokenResponse, dpopKeyPair, dpopNonce } = oauthResult;

		// For guests, allow any ATProto account (no DID check)
		// Create session with a "guest_" prefix to differentiate from admin sessions
		const sessionId = await createSession(
			c.env.SESSIONS,
			tokenResponse.access_token,
			tokenResponse.refresh_token || "",
			dpopKeyPair,
			dpopNonce,
			tokenResponse.sub,
			tokenResponse.expires_in,
			undefined, // handle
			pdsUrl, // user's PDS URL
		);

		// Prefix session ID to mark as guest
		const guestSessionId = `guest_${sessionId}`;

		// Store the original session ID mapping
		await c.env.SESSIONS.put(
			`guest_session:${guestSessionId}`,
			sessionId,
			{ expirationTtl: 60 * 60 * 24 * 14 }, // 14 days
		);

		// Set session cookie and redirect to return URL
		setSessionCookie(c, guestSessionId, c.env.CLIENT_URL);
		return c.redirect(`${c.env.CLIENT_URL}${returnTo}`);
	} catch (error) {
		console.error("Guest callback error:", error);
		return c.redirect(`${c.env.CLIENT_URL}/now?error=callback_failed`);
	}
});

// Logout endpoint for guests
guestAuth.post("/logout", async (c) => {
	const sessionId = getSessionIdFromCookie(c);

	if (sessionId?.startsWith("guest_")) {
		// Get original session ID
		const originalSessionId = await c.env.SESSIONS.get(
			`guest_session:${sessionId}`,
		);
		if (originalSessionId) {
			await deleteSession(c.env.SESSIONS, originalSessionId);
			await c.env.SESSIONS.delete(`guest_session:${sessionId}`);
		}
	}

	clearSessionCookie(c, c.env.CLIENT_URL);
	return c.json({ success: true });
});

// Check auth status for guests
guestAuth.get("/status", async (c) => {
	const sessionId = getSessionIdFromCookie(c);

	if (!sessionId || !sessionId.startsWith("guest_")) {
		return c.json({ authenticated: false });
	}

	// Get original session ID
	const originalSessionId = await c.env.SESSIONS.get(
		`guest_session:${sessionId}`,
	);
	if (!originalSessionId) {
		clearSessionCookie(c, c.env.CLIENT_URL);
		return c.json({ authenticated: false });
	}

	const sessionData = await getSession(c.env.SESSIONS, originalSessionId);
	if (!sessionData) {
		clearSessionCookie(c, c.env.CLIENT_URL);
		await c.env.SESSIONS.delete(`guest_session:${sessionId}`);
		return c.json({ authenticated: false });
	}

	const { session, dpopKeyPair } = sessionData;

	// Check if token needs refresh
	if (isTokenExpired(session.expiresAt) && session.refreshToken) {
		try {
			// Use the user's PDS URL stored in session
			if (!session.pdsUrl) {
				console.error("No PDS URL in session for token refresh");
				await deleteSession(c.env.SESSIONS, originalSessionId);
				await c.env.SESSIONS.delete(`guest_session:${sessionId}`);
				clearSessionCookie(c, c.env.CLIENT_URL);
				return c.json({ authenticated: false });
			}
			const metadata = await fetchOAuthMetadata(session.pdsUrl);
			const clientId = `${c.env.API_URL}/guest-auth/client-metadata.json`;

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
				originalSessionId,
				tokenResponse.access_token,
				tokenResponse.refresh_token || session.refreshToken,
				dpopNonce,
				tokenResponse.expires_in,
			);

			return c.json({
				authenticated: true,
				did: session.did,
				handle: session.handle,
				isGuest: true,
			});
		} catch (error) {
			console.error("Token refresh failed:", error);
			await deleteSession(c.env.SESSIONS, originalSessionId);
			await c.env.SESSIONS.delete(`guest_session:${sessionId}`);
			clearSessionCookie(c, c.env.CLIENT_URL);
			return c.json({ authenticated: false });
		}
	}

	return c.json({
		authenticated: true,
		did: session.did,
		handle: session.handle,
		isGuest: true,
	});
});

export default guestAuth;
