import { useEffect, useState } from "react";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
});

const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";
const PDS_URL = "https://polybius.social";

interface Document {
	uri: string;
	value: {
		title: string;
		publishedAt: string;
		path: string;
		content?: {
			markdown?: string;
		};
		textContent?: string;
	};
}

export default function NowUpdates() {
	const [documents, setDocuments] = useState<Document[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function fetchPosts() {
			try {
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

				const sortedDocuments: Document[] = (documentsData.records || []).sort(
					(a: Document, b: Document) => {
						const dateA = new Date(a.value.publishedAt);
						const dateB = new Date(b.value.publishedAt);
						return dateB.getTime() - dateA.getTime();
					},
				);

				setDocuments(sortedDocuments);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching updates:", err);
				setError(true);
				setLoading(false);
			}
		}

		fetchPosts();
	}, []);

	if (loading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return (
			<p>Error loading recent updates. Make sure your PDS is accessible.</p>
		);
	}

	if (documents.length === 0) {
		return <p>No recent updates found.</p>;
	}

	return (
		<div className="space-y-4">
			{documents.map((record) => {
				const value = record.value;
				const path = value.path.slice(1);
				const publishedAt = new Date(value.publishedAt).toLocaleDateString();

				let contentHTML = "";
				if (value.content && value.content.markdown) {
					contentHTML = md.render(value.content.markdown).trim();
				} else if (value.textContent) {
					contentHTML = `<p>${value.textContent}</p>`;
				}

				return (
					<article
						key={record.uri}
						className="border-b pb-6 mb-6 last:border-b-0"
					>
						<a
							href={`/now/${path}`}
							className="block hover:opacity-80 transition-opacity"
						>
							<h3 className="text-lg font-semibold mb-3">{value.title}</h3>
						</a>
						<div
							className="prose prose-invert max-w-none mb-3"
							dangerouslySetInnerHTML={{ __html: contentHTML }}
						/>
						<div className="flex items-center gap-2 text-sm text-gray-500">
							<time>{publishedAt}</time>
						</div>
					</article>
				);
			})}
		</div>
	);
}
