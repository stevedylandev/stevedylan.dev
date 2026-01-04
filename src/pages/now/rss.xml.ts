import rss from "@astrojs/rss";
import siteMeta from "@/site-config";

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

export async function GET() {
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

		const data = await response.json();

		// Filter out replies (posts that have a reply reference)
		const posts = data.records
			? data.records.filter((record) => !record.value.reply)
			: [];

		const items = posts.map((record) => {
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

			return {
				title:
					post.text.substring(0, 100) + (post.text.length > 100 ? "..." : ""),
				description: post.text,
				pubDate: new Date(post.createdAt),
				link: `https://stevedylan.dev/pds?rkey=${rkey}`,
				content: content,
			};
		});

		return rss({
			title: `${siteMeta.title} - Updates`,
			description:
				"Small updates from my life that don't quite fit into a blog",
			site: process.env.SITE_URL || "https://stevedylan.dev",
			items: items,
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);

		// Return an empty feed on error
		return rss({
			title: `${siteMeta.title} - Updates`,
			description:
				"Small updates from my life that don't quite fit into a blog",
			site: process.env.SITE_URL || "https://stevedylan.dev",
			items: [],
		});
	}
}
