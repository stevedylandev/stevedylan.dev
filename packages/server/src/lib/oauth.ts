import * as jose from "jose";
import { type DPoPKeyPair, createDPoPProof, extractDPoPNonce } from "./dpop";

export interface OAuthServerMetadata {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	pushed_authorization_request_endpoint: string;
	scopes_supported?: string[];
	response_types_supported?: string[];
	grant_types_supported?: string[];
	dpop_signing_alg_values_supported?: string[];
}

export interface PKCEPair {
	codeVerifier: string;
	codeChallenge: string;
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	scope: string;
	sub: string; // The DID of the authenticated user
}

export interface PARResponse {
	request_uri: string;
	expires_in: number;
}

interface OAuthErrorResponse {
	error: string;
	error_description?: string;
}

/**
 * Fetch OAuth server metadata from PDS
 */
export async function fetchOAuthMetadata(
	pdsUrl: string,
): Promise<OAuthServerMetadata> {
	const metadataUrl = `${pdsUrl}/.well-known/oauth-authorization-server`;
	const response = await fetch(metadataUrl);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch OAuth metadata: ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE(): Promise<PKCEPair> {
	// Generate 32 random bytes for code verifier
	const verifierBytes = new Uint8Array(32);
	crypto.getRandomValues(verifierBytes);
	const codeVerifier = jose.base64url.encode(verifierBytes);

	// Generate S256 challenge
	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const codeChallenge = jose.base64url.encode(new Uint8Array(hashBuffer));

	return { codeVerifier, codeChallenge };
}

/**
 * Generate a random state token
 */
export function generateState(): string {
	const stateBytes = new Uint8Array(32);
	crypto.getRandomValues(stateBytes);
	return jose.base64url.encode(stateBytes);
}

/**
 * Send a Pushed Authorization Request (PAR) to the PDS
 */
export async function sendPAR(
	metadata: OAuthServerMetadata,
	clientId: string,
	redirectUri: string,
	state: string,
	pkce: PKCEPair,
	dpopKeyPair: DPoPKeyPair,
	scope: string,
	dpopNonce?: string,
): Promise<{ parResponse: PARResponse; dpopNonce: string }> {
	const parEndpoint = metadata.pushed_authorization_request_endpoint;

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		state,
		scope,
		code_challenge: pkce.codeChallenge,
		code_challenge_method: "S256",
	});

	// Create DPoP proof for this request
	const dpopProof = await createDPoPProof(dpopKeyPair, {
		method: "POST",
		url: parEndpoint,
		nonce: dpopNonce,
	});

	const response = await fetch(parEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			DPoP: dpopProof,
		},
		body: params.toString(),
	});

	// Handle DPoP nonce requirement
	const newNonce = extractDPoPNonce(response);

	if (response.status === 400 || response.status === 401) {
		const error: OAuthErrorResponse = await response.json();
		if (error.error === "use_dpop_nonce" && newNonce) {
			// Retry with the nonce
			return sendPAR(
				metadata,
				clientId,
				redirectUri,
				state,
				pkce,
				dpopKeyPair,
				scope,
				newNonce,
			);
		}
		throw new Error(`PAR failed: ${error.error_description || error.error}`);
	}

	if (!response.ok) {
		throw new Error(`PAR failed: ${response.status} ${response.statusText}`);
	}

	const parResponse: PARResponse = await response.json();
	return {
		parResponse,
		dpopNonce: newNonce || dpopNonce || "",
	};
}

/**
 * Build the authorization URL for redirecting the user
 */
export function buildAuthorizationUrl(
	metadata: OAuthServerMetadata,
	requestUri: string,
	clientId: string,
): string {
	const url = new URL(metadata.authorization_endpoint);
	url.searchParams.set("request_uri", requestUri);
	url.searchParams.set("client_id", clientId);
	return url.toString();
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
	metadata: OAuthServerMetadata,
	code: string,
	codeVerifier: string,
	clientId: string,
	redirectUri: string,
	dpopKeyPair: DPoPKeyPair,
	dpopNonce?: string,
): Promise<{ tokenResponse: TokenResponse; dpopNonce: string }> {
	const tokenEndpoint = metadata.token_endpoint;

	const params = new URLSearchParams({
		grant_type: "authorization_code",
		code,
		redirect_uri: redirectUri,
		client_id: clientId,
		code_verifier: codeVerifier,
	});

	// Create DPoP proof for token request
	const dpopProof = await createDPoPProof(dpopKeyPair, {
		method: "POST",
		url: tokenEndpoint,
		nonce: dpopNonce,
	});

	const response = await fetch(tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			DPoP: dpopProof,
		},
		body: params.toString(),
	});

	// Handle DPoP nonce requirement
	const newNonce = extractDPoPNonce(response);

	if (response.status === 400 || response.status === 401) {
		const error: OAuthErrorResponse = await response.json();
		if (error.error === "use_dpop_nonce" && newNonce) {
			// Retry with the nonce
			return exchangeCodeForTokens(
				metadata,
				code,
				codeVerifier,
				clientId,
				redirectUri,
				dpopKeyPair,
				newNonce,
			);
		}
		throw new Error(
			`Token exchange failed: ${error.error_description || error.error}`,
		);
	}

	if (!response.ok) {
		throw new Error(
			`Token exchange failed: ${response.status} ${response.statusText}`,
		);
	}

	const tokenResponse: TokenResponse = await response.json();
	return {
		tokenResponse,
		dpopNonce: newNonce || dpopNonce || "",
	};
}

/**
 * Refresh an access token
 */
export async function refreshAccessToken(
	metadata: OAuthServerMetadata,
	refreshToken: string,
	clientId: string,
	dpopKeyPair: DPoPKeyPair,
	dpopNonce?: string,
): Promise<{ tokenResponse: TokenResponse; dpopNonce: string }> {
	const tokenEndpoint = metadata.token_endpoint;

	const params = new URLSearchParams({
		grant_type: "refresh_token",
		refresh_token: refreshToken,
		client_id: clientId,
	});

	// Create DPoP proof for token request
	const dpopProof = await createDPoPProof(dpopKeyPair, {
		method: "POST",
		url: tokenEndpoint,
		nonce: dpopNonce,
	});

	const response = await fetch(tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			DPoP: dpopProof,
		},
		body: params.toString(),
	});

	// Handle DPoP nonce requirement
	const newNonce = extractDPoPNonce(response);

	if (response.status === 400 || response.status === 401) {
		const error: OAuthErrorResponse = await response.json();
		if (error.error === "use_dpop_nonce" && newNonce) {
			// Retry with the nonce
			return refreshAccessToken(
				metadata,
				refreshToken,
				clientId,
				dpopKeyPair,
				newNonce,
			);
		}
		throw new Error(
			`Token refresh failed: ${error.error_description || error.error}`,
		);
	}

	if (!response.ok) {
		throw new Error(
			`Token refresh failed: ${response.status} ${response.statusText}`,
		);
	}

	const tokenResponse: TokenResponse = await response.json();
	return {
		tokenResponse,
		dpopNonce: newNonce || dpopNonce || "",
	};
}
