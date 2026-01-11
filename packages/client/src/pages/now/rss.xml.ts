import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import { OWNER_DID, PDS_URL } from "@/data/constants";

export const prerender = false;

const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

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

export async function GET() {
	try {
		const response = await fetch(
			`${PDS_URL}/xrpc/com.atproto.repo.listRecords?` +
				new URLSearchParams({
					repo: OWNER_DID,
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

		const items = documents.map((record) => {
			const doc = record.value;
			const rkey = record.uri.split("/").pop();

			// Use custom path if available, otherwise use rkey
			const urlPath = doc.path || `/${rkey}`;

			// Always treat content as markdown and render to HTML
			const markdownContent = doc.content?.markdown || doc.title;
			const htmlContent = md.render(markdownContent);
			const description = doc.textContent || doc.title;

			return {
				title: doc.title,
				description: description,
				pubDate: new Date(doc.publishedAt),
				link: `/now${urlPath}`,
				content: sanitizeHtml(htmlContent, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		});

		return rss({
			title: "Steve Dylan - Updates",
			description:
				"Small updates from my life that don't quite fit into a blog",
			site: process.env.SITE_URL || "https://stevedylan.dev",
			items: items,
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);

		// Return an empty feed on error
		return rss({
			title: "Steve Dylan - Updates",
			description:
				"Small updates from my life that don't quite fit into a blog",
			site: process.env.SITE_URL || "https://stevedylan.dev",
			items: [],
		});
	}
}
