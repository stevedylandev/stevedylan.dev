import * as jose from "jose";

export interface DPoPKeyPair {
	privateKey: CryptoKey;
	publicKey: CryptoKey;
	publicJwk: jose.JWK;
}

export interface DPoPProofOptions {
	method: string;
	url: string;
	nonce?: string;
	accessToken?: string;
}

/**
 * Generate a new ES256 keypair for DPoP proofs
 */
export async function generateDPoPKeyPair(): Promise<DPoPKeyPair> {
	const keyPair = (await crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-256",
		},
		true,
		["sign", "verify"],
	)) as CryptoKeyPair;

	const publicJwk = await jose.exportJWK(keyPair.publicKey);

	return {
		privateKey: keyPair.privateKey,
		publicKey: keyPair.publicKey,
		publicJwk,
	};
}

/**
 * Export a DPoP keypair to a storable format
 */
export async function exportDPoPKeyPair(
	keyPair: DPoPKeyPair,
): Promise<{ privateJwk: jose.JWK; publicJwk: jose.JWK }> {
	const privateJwk = await jose.exportJWK(keyPair.privateKey);
	return {
		privateJwk,
		publicJwk: keyPair.publicJwk,
	};
}

/**
 * Import a DPoP keypair from stored JWKs
 */
export async function importDPoPKeyPair(stored: {
	privateJwk: jose.JWK;
	publicJwk: jose.JWK;
}): Promise<DPoPKeyPair> {
	// Use crypto.subtle.importKey with extractable: true
	// jose.importJWK creates non-extractable keys by default
	const privateKey = await crypto.subtle.importKey(
		"jwk",
		stored.privateJwk as JsonWebKey,
		{ name: "ECDSA", namedCurve: "P-256" },
		true, // extractable
		["sign"],
	);

	const publicKey = await crypto.subtle.importKey(
		"jwk",
		stored.publicJwk as JsonWebKey,
		{ name: "ECDSA", namedCurve: "P-256" },
		true, // extractable
		["verify"],
	);

	return {
		privateKey,
		publicKey,
		publicJwk: stored.publicJwk,
	};
}

/**
 * Create a DPoP proof JWT for a request
 */
export async function createDPoPProof(
	keyPair: DPoPKeyPair,
	options: DPoPProofOptions,
): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const jti = crypto.randomUUID();

	const payload: jose.JWTPayload = {
		jti,
		htm: options.method.toUpperCase(),
		htu: options.url,
		iat: now,
	};

	// Add nonce if provided (required after first request)
	if (options.nonce) {
		payload.nonce = options.nonce;
	}

	// Add access token hash if provided (for resource server requests)
	if (options.accessToken) {
		const encoder = new TextEncoder();
		const data = encoder.encode(options.accessToken);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = new Uint8Array(hashBuffer);
		payload.ath = jose.base64url.encode(hashArray);
	}

	const jwt = await new jose.SignJWT(payload)
		.setProtectedHeader({
			alg: "ES256",
			typ: "dpop+jwt",
			jwk: keyPair.publicJwk,
		})
		.sign(keyPair.privateKey);

	return jwt;
}

/**
 * Extract DPoP nonce from response headers
 */
export function extractDPoPNonce(response: Response): string | null {
	return response.headers.get("DPoP-Nonce");
}
