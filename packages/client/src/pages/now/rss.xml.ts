import type { APIRoute } from "astro";

export const prerender = false;

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

interface DocumentRecord {
	uri: string;
	cid: string;
	value: {
		$type: string;
		title: string;
		site: string;
		path?: string;
		content?: {
			$type: string;
			markdown: string;
		};
		textContent?: string;
		publishedAt: string;
	};
}

interface ListRecordsResponse {
	records: DocumentRecord[];
	cursor?: string;
}

export const GET: APIRoute = async () => {
	try {
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

		// Sort by publishedAt descending
		documents.sort((a, b) => {
			const dateA = new Date(a.value.publishedAt);
			const dateB = new Date(b.value.publishedAt);
			return dateB.getTime() - dateA.getTime();
		});

		// Build RSS XML manually to avoid dependencies
		const items = documents
			.map((record) => {
				const doc = record.value;
				const rkey = record.uri.split("/").pop();

				// Use custom path if available, otherwise use rkey
				const urlPath = doc.path || `/${rkey}`;
				const fullUrl = `https://stevedylan.dev/now${urlPath}`;

				let content = doc.title;
				let description = doc.title;

				if (doc.content && doc.content.markdown) {
					content = doc.content.markdown;
					description = doc.textContent || doc.title;
				} else if (doc.textContent) {
					content = doc.textContent;
					description = doc.textContent;
				}

				// Escape XML entities
				const escapeXml = (str: string) =>
					str
						.replace(/&/g, "&amp;")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")
						.replace(/"/g, "&quot;")
						.replace(/'/g, "&apos;");

				const pubDate = new Date(doc.publishedAt).toUTCString();

				return `    <item>
      <title>${escapeXml(doc.title)}</title>
      <link>${fullUrl}</link>
      <guid>${fullUrl}</guid>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
    </item>`;
			})
			.join("\n");

		const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Steve Dylan - Updates</title>
    <description>Small updates from my life that don't quite fit into a blog</description>
    <link>https://stevedylan.dev/now</link>
    <atom:link href="https://stevedylan.dev/now/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

		return new Response(rssXml, {
			status: 200,
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);

		// Return an empty feed on error
		const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Steve Dylan - Updates</title>
    <description>Small updates from my life that don't quite fit into a blog</description>
    <link>https://stevedylan.dev/now</link>
    <language>en</language>
  </channel>
</rss>`;

		return new Response(errorRss, {
			status: 200,
			headers: {
				"Content-Type": "application/xml",
			},
		});
	}
};
