import { useEffect, useState } from "react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
});

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

interface Record {
	uri: string;
	value: any;
	type: "document" | "post";
}

export default function NowUpdates() {
	const [content, setContent] = useState<string>("<p>Loading...</p>");

	useEffect(() => {
		async function fetchPosts() {
			try {
				// Fetch new site.standard.document records
				const documentsPromise = fetch(
					`${PDS_URL}/xrpc/com.atproto.repo.listRecords?` +
						new URLSearchParams({
							repo: DID,
							collection: "site.standard.document",
							limit: "20",
						}),
				)
					.then((res) => (res.ok ? res.json() : { records: [] }))
					.catch(() => ({ records: [] }));

				// Fetch old app.bsky.feed.post records for backward compatibility
				const postsPromise = fetch(
					`${PDS_URL}/xrpc/com.atproto.repo.listRecords?` +
						new URLSearchParams({
							repo: DID,
							collection: "app.bsky.feed.post",
							limit: "20",
							filter: "posts_no_replies",
						}),
				)
					.then((res) => (res.ok ? res.json() : { records: [] }))
					.catch(() => ({ records: [] }));

				const [documentsData, postsData] = await Promise.all([
					documentsPromise,
					postsPromise,
				]);

				// Combine and normalize records
				const documents = (documentsData.records || []).map((record: any) => ({
					...record,
					type: "document",
				}));

				const posts = (postsData.records || [])
					.filter((record: any) => !record.value.reply)
					.map((record: any) => ({
						...record,
						type: "post",
					}));

				// Combine all records and sort by date
				const allRecords: Record[] = [...documents, ...posts].sort((a, b) => {
					const dateA = new Date(a.value.publishedAt || a.value.createdAt);
					const dateB = new Date(b.value.publishedAt || b.value.createdAt);
					return dateB.getTime() - dateA.getTime(); // Most recent first
				});

				if (allRecords.length === 0) {
					setContent("<p>No recent updates found.</p>");
					return;
				}

				const postsHTML = allRecords
					.map((record) => {
						const value = record.value;
						const rkey = record.uri.split("/").pop();

						// Render based on record type
						if (record.type === "document") {
							// site.standard.document
							const publishedAt = new Date(
								value.publishedAt,
							).toLocaleDateString();

							// Extract markdown content
							let contentHTML = "";
							if (value.content && value.content.markdown) {
								contentHTML = md.render(value.content.markdown);
							} else if (value.textContent) {
								contentHTML = `<p>${value.textContent}</p>`;
							}

							return `
              <a href="/pds?rkey=${rkey}" class="block border-b pb-6 mb-6 last:border-b-0">
                <article>
                  <h3 class="text-lg font-semibold mb-3">${value.title}</h3>
                  <div class="prose prose-invert max-w-none mb-3">
                    ${contentHTML}
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <time>${publishedAt}</time>
                  </div>
                </article>
              </a>
            `;
						} else {
							// app.bsky.feed.post (backward compatibility)
							const createdAt = new Date(value.createdAt).toLocaleDateString();

							// Handle images
							let imagesHTML = "";
							if (
								value.embed &&
								value.embed.$type === "app.bsky.embed.images" &&
								value.embed.images
							) {
								const imageElements = value.embed.images
									.map((image: any) => {
										const blobUrl =
											`${PDS_URL}/xrpc/com.atproto.sync.getBlob?` +
											new URLSearchParams({
												did: DID,
												cid: image.image.ref.$link,
											});

										return `
                  <img
                    src="${blobUrl}"
                    alt="${image.alt || "Image from post"}"
                    class="max-w-full h-auto"
                    loading="lazy"
                  />
                `;
									})
									.join("");

								imagesHTML = `
                <div class="mt-3 grid gap-2 ${value.embed.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}">
                  ${imageElements}
                </div>
              `;
							}

							return `
              <a href="/pds?rkey=${rkey}" class="block border-b pb-6 mb-6 last:border-b-0">
                <article>
                  <p class="mb-2">${value.text}</p>
                  ${imagesHTML}
                  <time class="text-sm text-gray-500 mt-2 block">${createdAt}</time>
                </article>
              </a>
            `;
						}
					})
					.join("");

				setContent(`
          <div class="space-y-4">
            <div>${postsHTML}</div>
          </div>
        `);
			} catch (err) {
				console.error("Error fetching updates:", err);
				setContent(
					"<p>Error loading recent updates. Make sure your PDS is accessible.</p>",
				);
			}
		}

		fetchPosts();
	}, []);

	return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
