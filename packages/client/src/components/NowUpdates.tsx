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
}

export default function NowUpdates() {
	const [content, setContent] = useState<string>("<p>Loading...</p>");

	useEffect(() => {
		async function fetchPosts() {
			try {
				// Fetch site.standard.document records only
				const documentsData = await fetch(
					`${PDS_URL}/xrpc/com.atproto.repo.listRecords?` +
						new URLSearchParams({
							repo: DID,
							collection: "site.standard.document",
							limit: "20",
						}),
				)
					.then((res) => (res.ok ? res.json() : { records: [] }))
					.catch(() => ({ records: [] }));

				const documents: Record[] = (documentsData.records || []).sort(
					(a: Record, b: Record) => {
						const dateA = new Date(a.value.publishedAt);
						const dateB = new Date(b.value.publishedAt);
						return dateB.getTime() - dateA.getTime(); // Most recent first
					},
				);

				if (documents.length === 0) {
					setContent("<p>No recent updates found.</p>");
					return;
				}

				const postsHTML = documents
					.map((record) => {
						const value = record.value;
						const rkey = record.uri.split("/").pop();
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
              <a href="/now/${rkey}" class="block border-b pb-6 mb-6 last:border-b-0">
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
