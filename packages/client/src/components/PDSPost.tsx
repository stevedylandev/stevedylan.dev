import { useEffect, useState } from "react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
});

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

export default function PDSPost() {
	const [content, setContent] = useState<string>("<p>Loading...</p>");

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const rkey = urlParams.get("rkey");

		async function fetchPost() {
			if (!rkey) {
				setContent("<p>No post specified.</p>");
				return;
			}

			try {
				// Try fetching as a document first
				const documentResponse = await fetch(
					`${PDS_URL}/xrpc/com.atproto.repo.getRecord?` +
						new URLSearchParams({
							repo: DID,
							collection: "site.standard.document",
							rkey: rkey,
						}),
				);

				if (documentResponse.ok) {
					const data = await documentResponse.json();
					const doc = data.value;
					const publishedAt = new Date(doc.publishedAt).toLocaleDateString();

					// Extract markdown content
					let contentHTML = "";
					if (doc.content && doc.content.markdown) {
						contentHTML = md.render(doc.content.markdown);
					} else if (doc.textContent) {
						contentHTML = `<p>${doc.textContent}</p>`;
					}

					setContent(`
            <article class="max-w-2xl mx-auto">
              <h1 class="text-2xl font-bold mb-4">${doc.title}</h1>
              <div class="prose prose-invert max-w-none mb-4">
                ${contentHTML}
              </div>
              <div class="flex items-center justify-between mt-4">
                <time class="text-sm text-gray-500">${publishedAt}</time>
                <button
                  id="share-btn"
                  class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Share
                </button>
              </div>
              <div class="mt-12">
                <a class="style-link" href="/now">← Now</a>
              </div>
            </article>
          `);

					document.title = doc.title;
					return;
				}

				// Fall back to fetching as a post
				const postResponse = await fetch(
					`${PDS_URL}/xrpc/com.atproto.repo.getRecord?` +
						new URLSearchParams({
							repo: DID,
							collection: "app.bsky.feed.post",
							rkey: rkey,
						}),
				);

				if (!postResponse.ok) {
					throw new Error(`HTTP error! status: ${postResponse.status}`);
				}

				const data = await postResponse.json();
				const post = data.value;
				const createdAt = new Date(post.createdAt).toLocaleDateString();

				// Handle images
				let imagesHTML = "";
				if (
					post.embed &&
					post.embed.$type === "app.bsky.embed.images" &&
					post.embed.images
				) {
					const imageElements = post.embed.images
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
            <div class="mt-3 grid gap-2 ${post.embed.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}">
              ${imageElements}
            </div>
          `;
				}

				setContent(`
          <article class="max-w-2xl mx-auto">
            <p class="mb-2">${post.text}</p>
            ${imagesHTML}
            <div class="flex items-center justify-between mt-4">
              <time class="text-sm text-gray-500">${createdAt}</time>
              <button
                id="share-btn"
                class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Share
              </button>
            </div>
            <div class="mt-12">
              <a class="style-link" href="/now">← Now</a>
            </div>
          </article>
        `);

				document.title = post.text;
			} catch (err) {
				console.error("Error fetching post:", err);
				setContent(
					"<p>Error loading post. Make sure your PDS is accessible.</p>",
				);
			}
		}

		fetchPost();
	}, []);

	// Handle share button click
	useEffect(() => {
		const handleShare = () => {
			const url = window.location.href;
			navigator.clipboard
				.writeText(url)
				.then(() => {
					const btn = document.getElementById("share-btn");
					if (btn) {
						const originalText = btn.textContent;
						btn.textContent = "Copied!";
						setTimeout(() => {
							btn.textContent = originalText;
						}, 2000);
					}
				})
				.catch((err) => {
					console.error("Failed to copy URL:", err);
					alert("Failed to copy URL");
				});
		};

		// Add event listener after content is rendered
		const btn = document.getElementById("share-btn");
		if (btn) {
			btn.addEventListener("click", handleShare);
			return () => btn.removeEventListener("click", handleShare);
		}
	}, [content]);

	return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
