import { Hono } from "hono";
import { Feed } from "feed";
import type { ListRecordsResponse } from "../types";

const now = new Hono();

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

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
