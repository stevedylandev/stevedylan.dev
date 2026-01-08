import type { Context } from "hono";
import type { JWK } from "jose";
import { exportDPoPKeyPair, importDPoPKeyPair, type DPoPKeyPair } from "./dpop";

export interface StoredSession {
	accessToken: string;
	refreshToken: string;
	dpopPrivateJwk: JWK;
	dpopPublicJwk: JWK;
	dpopNonce: string;
	did: string;
	handle?: string;
	expiresAt: number; // Unix timestamp
	createdAt: number;
}

export interface AuthState {
	codeVerifier: string;
	state: string;
	dpopPrivateJwk: JWK;
	dpopPublicJwk: JWK;
	dpopNonce: string;
	createdAt: number;
}

const SESSION_COOKIE_NAME = "session_id";
const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days in seconds
const AUTH_STATE_TTL = 60 * 10; // 10 minutes in seconds

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Store auth state during OAuth flow
 */
export async function storeAuthState(
	kv: KVNamespace,
	state: string,
	codeVerifier: string,
	dpopKeyPair: DPoPKeyPair,
	dpopNonce: string,
): Promise<void> {
	const exported = await exportDPoPKeyPair(dpopKeyPair);

	const authState: AuthState = {
		codeVerifier,
		state,
		dpopPrivateJwk: exported.privateJwk,
		dpopPublicJwk: exported.publicJwk,
		dpopNonce,
		createdAt: Date.now(),
	};

	await kv.put(`auth_state:${state}`, JSON.stringify(authState), {
		expirationTtl: AUTH_STATE_TTL,
	});
}

/**
 * Retrieve and delete auth state
 */
export async function getAndDeleteAuthState(
	kv: KVNamespace,
	state: string,
): Promise<{
	codeVerifier: string;
	dpopKeyPair: DPoPKeyPair;
	dpopNonce: string;
} | null> {
	const data = await kv.get(`auth_state:${state}`);
	if (!data) return null;

	// Delete the auth state (one-time use)
	await kv.delete(`auth_state:${state}`);

	const authState: AuthState = JSON.parse(data);
	const dpopKeyPair = await importDPoPKeyPair({
		privateJwk: authState.dpopPrivateJwk,
		publicJwk: authState.dpopPublicJwk,
	});

	return {
		codeVerifier: authState.codeVerifier,
		dpopKeyPair,
		dpopNonce: authState.dpopNonce,
	};
}

/**
 * Create a new session and store it in KV
 */
export async function createSession(
	kv: KVNamespace,
	accessToken: string,
	refreshToken: string,
	dpopKeyPair: DPoPKeyPair,
	dpopNonce: string,
	did: string,
	expiresIn: number,
	handle?: string,
): Promise<string> {
	const sessionId = generateSessionId();
	const exported = await exportDPoPKeyPair(dpopKeyPair);

	const session: StoredSession = {
		accessToken,
		refreshToken,
		dpopPrivateJwk: exported.privateJwk,
		dpopPublicJwk: exported.publicJwk,
		dpopNonce,
		did,
		handle,
		expiresAt: Date.now() + expiresIn * 1000,
		createdAt: Date.now(),
	};

	await kv.put(`session:${sessionId}`, JSON.stringify(session), {
		expirationTtl: SESSION_TTL,
	});

	return sessionId;
}

/**
 * Get session from KV by session ID
 */
export async function getSession(
	kv: KVNamespace,
	sessionId: string,
): Promise<{ session: StoredSession; dpopKeyPair: DPoPKeyPair } | null> {
	const data = await kv.get(`session:${sessionId}`);
	if (!data) return null;

	const session: StoredSession = JSON.parse(data);
	const dpopKeyPair = await importDPoPKeyPair({
		privateJwk: session.dpopPrivateJwk,
		publicJwk: session.dpopPublicJwk,
	});

	return { session, dpopKeyPair };
}

/**
 * Update session with new tokens
 */
export async function updateSession(
	kv: KVNamespace,
	sessionId: string,
	accessToken: string,
	refreshToken: string,
	dpopNonce: string,
	expiresIn: number,
): Promise<void> {
	const data = await kv.get(`session:${sessionId}`);
	if (!data) throw new Error("Session not found");

	const session: StoredSession = JSON.parse(data);
	session.accessToken = accessToken;
	session.refreshToken = refreshToken;
	session.dpopNonce = dpopNonce;
	session.expiresAt = Date.now() + expiresIn * 1000;

	await kv.put(`session:${sessionId}`, JSON.stringify(session), {
		expirationTtl: SESSION_TTL,
	});
}

/**
 * Delete a session
 */
export async function deleteSession(
	kv: KVNamespace,
	sessionId: string,
): Promise<void> {
	await kv.delete(`session:${sessionId}`);
}

/**
 * Get session ID from cookie
 */
export function getSessionIdFromCookie(c: Context): string | null {
	const cookie = c.req.header("Cookie");
	if (!cookie) return null;

	const match = cookie.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
	return match ? match[1] : null;
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(
	c: Context,
	sessionId: string,
	clientUrl: string,
): void {
	const isLocalhost = clientUrl.includes("localhost");
	const domain = isLocalhost ? "" : "; Domain=.stevedylan.dev";
	const secure = isLocalhost ? "" : "; Secure";

	c.header(
		"Set-Cookie",
		`${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; SameSite=Lax; Path=/${domain}${secure}; Max-Age=${SESSION_TTL}`,
	);
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(c: Context, clientUrl: string): void {
	const isLocalhost = clientUrl.includes("localhost");
	const domain = isLocalhost ? "" : "; Domain=.stevedylan.dev";
	const secure = isLocalhost ? "" : "; Secure";

	c.header(
		"Set-Cookie",
		`${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/${domain}${secure}; Max-Age=0`,
	);
}

/**
 * Check if token is expired or about to expire (within 1 minute)
 */
export function isTokenExpired(expiresAt: number): boolean {
	return Date.now() > expiresAt - 60000;
}
