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

// Helper function to get session for both admin and guest users
async function getAnySession(c: any, sessionId: string) {
	if (sessionId.startsWith("guest_")) {
		// Guest session
		const originalSessionId = await c.env.SESSIONS.get(
			`guest_session:${sessionId}`,
		);
		if (!originalSessionId) return null;
		return await getSession(c.env.SESSIONS, originalSessionId);
	} else {
		// Admin session
		return await getSession(c.env.SESSIONS, sessionId);
	}
}

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
		const body = await c.req.json<{
			title: string;
			path?: string;
			content: string;
		}>();

		if (!body.title || body.title.trim().length === 0) {
			return c.json({ error: "Document title is required" }, 400);
		}

		if (body.title.length > 128) {
			return c.json({ error: "Title must be 128 characters or less" }, 400);
		}

		if (!body.content || body.content.trim().length === 0) {
			return c.json({ error: "Content is required" }, 400);
		}

		// Normalize and validate path if provided
		let normalizedPath = body.path;
		if (normalizedPath) {
			// Add leading / if missing
			if (!normalizedPath.startsWith("/")) {
				normalizedPath = `/${normalizedPath}`;
			}
			// Basic validation: no spaces, no special chars except dashes and underscores
			if (!/^\/[a-zA-Z0-9\-_\/]*$/.test(normalizedPath)) {
				return c.json(
					{
						error:
							"Path can only contain letters, numbers, dashes, underscores, and slashes",
					},
					400,
				);
			}
		}

		// Create the document record using site.standard.document lexicon
		const createRecordUrl = `${c.env.PDS_URL}/xrpc/com.atproto.repo.createRecord`;

		// Create markdown content with $type
		const markdownContent = {
			$type: "site.standard.content.markdown",
			markdown: body.content.trim(),
		};

		// Strip markdown for textContent (basic implementation)
		const textContent = body.content
			.trim()
			.replace(/#{1,6}\s/g, "") // Remove headers
			.replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
			.replace(/\*([^*]+)\*/g, "$1") // Remove italic
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
			.replace(/`([^`]+)`/g, "$1") // Remove code formatting
			.trim();

		const documentRecord = {
			repo: session.did,
			collection: "site.standard.document",
			record: {
				$type: "site.standard.document",
				publication: {
					uri: `at://${session.did}/site.standard.publication/self`,
				},
				title: body.title.trim(),
				site: "https://stevedylan.dev",
				...(normalizedPath && { path: normalizedPath.trim() }),
				content: markdownContent,
				textContent: textContent,
				publishedAt: new Date().toISOString(),
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
				body: JSON.stringify(documentRecord),
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
			console.error("Failed to create document:", errorData);
			return c.json(
				{ error: "Failed to create document", details: errorData },
				response.status as 400 | 401 | 403 | 500,
			);
		}

		const result = (await response.json()) as { uri: string; cid: string };
		return c.json({ success: true, uri: result.uri, cid: result.cid });
	} catch (error) {
		console.error("Error creating document:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

now.get("/rss", async (c) => {
	try {
		// Fetch documents directly from your PDS using the repo.listRecords endpoint
		const response = await fetch(
			`${PDS_URL}/xrpc/com.atproto.repo.listRecords?` +
				new URLSearchParams({
					repo: DID,
					collection: "site.standard.document",
					limit: "50",
				}),
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as ListRecordsResponse;
		const documents = data.records;

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

		// Add documents to the feed
		documents.forEach((record) => {
			const doc = record.value;
			const rkey = record.uri.split("/").pop();

			// Use custom path if available, otherwise use rkey
			const urlPath = doc.path || `/${rkey}`;
			const fullUrl = `https://stevedylan.dev/now${urlPath}`;

			// Extract content - prefer markdown content, fallback to textContent
			let content = doc.title;
			let description = doc.title;

			if (doc.content && doc.content.markdown) {
				content = doc.content.markdown;
				description = doc.textContent || doc.title;
			} else if (doc.textContent) {
				content = doc.textContent;
				description = doc.textContent;
			}

			feed.addItem({
				title: doc.title,
				id: fullUrl,
				link: fullUrl,
				description: description,
				content: content,
				date: new Date(doc.publishedAt),
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

// Create a reply to a post (for guests)
now.post("/reply", async (c) => {
	try {
		// Get session from cookie
		const sessionId = getSessionIdFromCookie(c);
		if (!sessionId) {
			return c.json({ error: "Not authenticated" }, 401);
		}

		const sessionData = await getAnySession(c, sessionId);
		if (!sessionData) {
			return c.json({ error: "Session not found" }, 401);
		}

		let { session, dpopKeyPair } = sessionData;

		// Refresh token if expired
		if (isTokenExpired(session.expiresAt) && session.refreshToken) {
			const metadata = await fetchOAuthMetadata(c.env.PDS_URL);
			const clientId = sessionId.startsWith("guest_")
				? `${c.env.API_URL}/guest-auth/client-metadata.json`
				: `${c.env.API_URL}/auth/client-metadata.json`;

			const { tokenResponse, dpopNonce } = await refreshAccessToken(
				metadata,
				session.refreshToken,
				clientId,
				dpopKeyPair,
				session.dpopNonce,
			);

			// Get the actual session ID for update
			const actualSessionId = sessionId.startsWith("guest_")
				? (await c.env.SESSIONS.get(`guest_session:${sessionId}`)) || ""
				: sessionId;

			// Update session with new tokens
			await updateSession(
				c.env.SESSIONS,
				actualSessionId,
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
		const body = await c.req.json<{
			parentUri: string;
			content: string;
		}>();

		if (!body.parentUri || body.parentUri.trim().length === 0) {
			return c.json({ error: "Parent URI is required" }, 400);
		}

		if (!body.content || body.content.trim().length === 0) {
			return c.json({ error: "Content is required" }, 400);
		}

		// Fetch the parent post to get its CID
		const getRecordUrl =
			`${c.env.PDS_URL}/xrpc/com.atproto.repo.getRecord?` +
			new URLSearchParams({
				repo: body.parentUri.split("/")[2], // Extract DID from URI
				collection: body.parentUri.split("/")[3], // Extract collection
				rkey: body.parentUri.split("/")[4], // Extract rkey
			});

		const parentResponse = await fetch(getRecordUrl);
		if (!parentResponse.ok) {
			console.error("Failed to fetch parent post");
			return c.json({ error: "Failed to fetch parent post" }, 400);
		}

		const parentData = await parentResponse.json();
		const parentCid = parentData.cid;

		// Create the reply record using app.bsky.feed.post lexicon
		const createRecordUrl = `${c.env.PDS_URL}/xrpc/com.atproto.repo.createRecord`;

		const replyRecord = {
			repo: session.did,
			collection: "app.bsky.feed.post",
			record: {
				$type: "app.bsky.feed.post",
				text: body.content.trim(),
				createdAt: new Date().toISOString(),
				reply: {
					root: {
						uri: body.parentUri,
						cid: parentCid,
					},
					parent: {
						uri: body.parentUri,
						cid: parentCid,
					},
				},
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
				body: JSON.stringify(replyRecord),
			});
		};

		let response = await makeRequest();

		// Handle DPoP nonce requirement
		if (response.status === 401) {
			const newNonce = extractDPoPNonce(response);
			if (newNonce) {
				// Retry with new nonce
				response = await makeRequest(newNonce);

				// Get the actual session ID for update
				const actualSessionId = sessionId.startsWith("guest_")
					? (await c.env.SESSIONS.get(`guest_session:${sessionId}`)) || ""
					: sessionId;

				// Update session with new nonce
				await updateSession(
					c.env.SESSIONS,
					actualSessionId,
					session.accessToken,
					session.refreshToken,
					newNonce,
					Math.floor((session.expiresAt - Date.now()) / 1000),
				);
			}
		}

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Failed to create reply:", errorData);
			return c.json(
				{ error: "Failed to create reply", details: errorData },
				response.status as 400 | 401 | 403 | 500,
			);
		}

		const result = (await response.json()) as { uri: string; cid: string };
		return c.json({ success: true, uri: result.uri, cid: result.cid });
	} catch (error) {
		console.error("Error creating reply:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// Get replies for a post
now.get("/replies/:uri", async (c) => {
	try {
		const encodedUri = c.req.param("uri");
		const uri = decodeURIComponent(encodedUri);

		// Use app.bsky.feed.getPostThread to fetch the post and its replies
		const threadUrl = `${PDS_URL}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}`;

		const response = await fetch(threadUrl);

		if (!response.ok) {
			console.error("Failed to fetch thread:", response.status);
			return c.json({ replies: [] });
		}

		const data = await response.json();

		// Extract replies from the thread
		const replies: any[] = [];

		if (data.thread?.replies && Array.isArray(data.thread.replies)) {
			for (const reply of data.thread.replies) {
				if (reply.post) {
					replies.push({
						uri: reply.post.uri,
						cid: reply.post.cid,
						author: {
							did: reply.post.author.did,
							handle: reply.post.author.handle,
							displayName: reply.post.author.displayName,
							avatar: reply.post.author.avatar,
						},
						record: reply.post.record,
						indexedAt: reply.post.indexedAt,
						replyCount: reply.post.replyCount || 0,
						likeCount: reply.post.likeCount || 0,
					});
				}
			}
		}

		return c.json({ replies });
	} catch (error) {
		console.error("Error fetching replies:", error);
		return c.json({ replies: [] });
	}
});

export default now;
