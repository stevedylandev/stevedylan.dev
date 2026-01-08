import { Hono } from "hono";
import { Feed } from "feed";
import type { ListRecordsResponse } from "../types";
import { createDPoPProof, extractDPoPNonce } from "../lib/dpop";
import { fetchOAuthMetadata, refreshAccessToken } from "../lib/oauth";
import {
	getSession,
	getSessionIdFromCookie,
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

const now = new Hono<{ Bindings: Env }>();

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

// Create a new post
now.post("/post", async (c) => {
	try {
		// Get session from cookie
		const sessionId = getSessionIdFromCookie(c);
		if (!sessionId) {
			return c.json({ error: "Not authenticated" }, 401);
		}

		const sessionData = await getSession(c.env.SESSIONS, sessionId);
		if (!sessionData) {
			return c.json({ error: "Session not found" }, 401);
		}

		let { session, dpopKeyPair } = sessionData;

		// Refresh token if expired
		if (isTokenExpired(session.expiresAt) && session.refreshToken) {
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

			// Update local session object
			session.accessToken = tokenResponse.access_token;
			session.dpopNonce = dpopNonce;
		}

		// Parse request body
		const body = await c.req.json<{ text: string }>();
		if (!body.text || body.text.trim().length === 0) {
			return c.json({ error: "Post text is required" }, 400);
		}

		if (body.text.length > 300) {
			return c.json({ error: "Post text must be 300 characters or less" }, 400);
		}

		// Create the post record
		const createRecordUrl = `${c.env.PDS_URL}/xrpc/com.atproto.repo.createRecord`;

		const postRecord = {
			repo: session.did,
			collection: "app.bsky.feed.post",
			record: {
				$type: "app.bsky.feed.post",
				text: body.text.trim(),
				createdAt: new Date().toISOString(),
			},
		};

		// Make request with DPoP
		const makeRequest = async (nonce?: string): Promise<Response> => {
			const dpopProof = await createDPoPProof(dpopKeyPair, {
				method: "POST",
				url: createRecordUrl,
				nonce: nonce || session.dpopNonce,
				accessToken: session.accessToken,
			});

			return fetch(createRecordUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `DPoP ${session.accessToken}`,
					DPoP: dpopProof,
				},
				body: JSON.stringify(postRecord),
			});
		};

		let response = await makeRequest();

		// Handle DPoP nonce requirement
		if (response.status === 401) {
			const newNonce = extractDPoPNonce(response);
			if (newNonce) {
				// Retry with new nonce
				response = await makeRequest(newNonce);

				// Update session with new nonce
				await updateSession(
					c.env.SESSIONS,
					sessionId,
					session.accessToken,
					session.refreshToken,
					newNonce,
					Math.floor((session.expiresAt - Date.now()) / 1000),
				);
			}
		}

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Failed to create post:", errorData);
			return c.json(
				{ error: "Failed to create post", details: errorData },
				response.status as 400 | 401 | 403 | 500,
			);
		}

		const result = (await response.json()) as { uri: string; cid: string };
		return c.json({ success: true, uri: result.uri, cid: result.cid });
	} catch (error) {
		console.error("Error creating post:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

now.get("/rss", async (c) => {
	try {
		// Fetch posts directly from your PDS using the repo.listRecords endpoint
		const response = await fetch(
			`${PDS_URL}/xrpc/com.atproto.repo.listRecords?` +
				new URLSearchParams({
					repo: DID,
					collection: "app.bsky.feed.post",
					limit: "50",
					filter: "posts_no_replies",
				}),
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as ListRecordsResponse;
		const posts = data.records.filter((record) => !record.value.reply);

		// Create the feed
		const feed = new Feed({
			title: "Steve Dylan - Updates",
			description:
				"Small updates from my life that don't quite fit into a blog",
			id: "https://stevedylan.dev/",
			link: "https://stevedylan.dev/",
			language: "en",
			favicon: "https://stevedylan.dev/favicon.ico",
			copyright: "All rights reserved, Steve Dylan",
			updated: new Date(),
			feedLinks: {
				rss: "https://stevedylan.dev/now/rss",
			},
			author: {
				name: "Steve Dylan",
				link: "https://stevedylan.dev",
			},
		});

		// Add posts to the feed
		posts.forEach((record) => {
			const post = record.value;
			const rkey = record.uri.split("/").pop();

			// Build content with images if they exist
			let content = post.text;

			if (
				post.embed &&
				post.embed.$type === "app.bsky.embed.images" &&
				post.embed.images
			) {
				const imageHTML = post.embed.images
					.map((image) => {
						const blobUrl =
							`${PDS_URL}/xrpc/com.atproto.sync.getBlob?` +
							new URLSearchParams({
								did: DID,
								cid: image.image.ref.$link,
							});

						return `<img src="${blobUrl}" alt="${image.alt || "Image from post"}" />`;
					})
					.join("");

				content = `<p>${post.text}</p>${imageHTML}`;
			}

			feed.addItem({
				title:
					post.text.substring(0, 100) + (post.text.length > 100 ? "..." : ""),
				id: `https://stevedylan.dev/pds?rkey=${rkey}`,
				link: `https://stevedylan.dev/pds?rkey=${rkey}`,
				description: post.text,
				content: content,
				date: new Date(post.createdAt),
			});
		});

		// Return RSS 2.0 feed
		const rssOutput = feed.rss2();

		return c.text(rssOutput, 200, {
			"Content-Type": "application/xml",
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);

		// Return an empty feed on error
		const errorFeed = new Feed({
			title: "Steve Dylan - Updates",
			description:
				"Small updates from my life that don't quite fit into a blog",
			id: "https://stevedylan.dev/",
			link: "https://stevedylan.dev/",
			language: "en",
			updated: new Date(),
			copyright: "All rights reserved, Steve Dylan",
			author: {
				name: "Steve Dylan",
				link: "https://stevedylan.dev",
			},
		});

		return c.text(errorFeed.rss2(), 200, {
			"Content-Type": "application/xml",
		});
	}
});

export default now;
