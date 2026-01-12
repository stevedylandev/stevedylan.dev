// Standard.site lexicon types
export interface StandardSiteMarkdownContent {
	$type: "site.standard.content.markdown";
	markdown: string;
}

export interface StandardSiteBlobRef {
	$type: "blob";
	ref: {
		$link: string;
	};
	mimeType: string;
	size: number;
}

export interface StandardSiteStrongRef {
	uri: string;
	cid: string;
}

export interface StandardSiteDocument {
	$type: "site.standard.document";
	site: string; // URI or HTTPS URL
	path?: string; // Path to combine with site
	title: string; // Max 128 graphemes
	description?: string; // Max 300 graphemes
	coverImage?: StandardSiteBlobRef; // Max 1MB
	content?: StandardSiteMarkdownContent; // Union type for content
	textContent?: string; // Plaintext without formatting
	bskyPostRef?: StandardSiteStrongRef; // Reference to Bluesky post
	tags?: string[]; // Max 50 graphemes per tag
	publishedAt: string; // ISO datetime string
	updatedAt?: string; // ISO datetime string
	location?: string; // Custom field for filtering posts by location
}

export interface StandardSiteDocumentRecord {
	uri: string;
	cid: string;
	value: StandardSiteDocument;
}

export interface ListRecordsResponse {
	records: StandardSiteDocumentRecord[];
	cursor?: string;
}
