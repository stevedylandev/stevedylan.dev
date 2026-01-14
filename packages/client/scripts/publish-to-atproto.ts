#!/usr/bin/env bun

import { AtpAgent } from "@atproto/api";
import * as fs from "fs";
import * as path from "path";

const CONTENT_DIR = path.join(import.meta.dir, "../src/content/post");
const PDS_URL = process.env.PDS_URL || "https://polybius.social";
const PUBLICATION_URI =
	"at://did:plc:ia2zdnhjaokf5lazhxrmj6eu/site.standard.publication/3mbykzswhqc2x";
const SITE_URL = "https://stevedylan.dev";

interface PostFrontmatter {
	title: string;
	description: string;
	publishDate: string;
	tags?: string[];
	ogImage?: string;
	hidden?: boolean;
	atUri?: string;
}

interface BlogPost {
	filePath: string;
	slug: string;
	frontmatter: PostFrontmatter;
	content: string;
	rawContent: string;
}

function parseFrontmatter(content: string): {
	frontmatter: PostFrontmatter;
	body: string;
} {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		throw new Error("Could not parse frontmatter");
	}

	const frontmatterStr = match[1];
	const body = match[2];

	// Parse YAML-like frontmatter manually
	const frontmatter: Record<string, unknown> = {};
	const lines = frontmatterStr.split("\n");

	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) continue;

		const key = line.slice(0, colonIndex).trim();
		let value = line.slice(colonIndex + 1).trim();

		// Handle quoted strings
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		// Handle arrays (simple case for tags)
		if (value.startsWith("[") && value.endsWith("]")) {
			const arrayContent = value.slice(1, -1);
			frontmatter[key] = arrayContent
				.split(",")
				.map((item) => item.trim().replace(/^["']|["']$/g, ""));
		} else if (value === "true") {
			frontmatter[key] = true;
		} else if (value === "false") {
			frontmatter[key] = false;
		} else {
			frontmatter[key] = value;
		}
	}

	return { frontmatter: frontmatter as unknown as PostFrontmatter, body };
}

function getSlugFromFilename(filename: string): string {
	return filename
		.replace(/\.mdx?$/, "")
		.toLowerCase()
		.replace(/\s+/g, "-");
}

async function getRecentPosts(limit: number = 1): Promise<BlogPost[]> {
	const files = fs.readdirSync(CONTENT_DIR);
	const posts: BlogPost[] = [];

	for (const file of files) {
		if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;

		const filePath = path.join(CONTENT_DIR, file);
		const rawContent = fs.readFileSync(filePath, "utf-8");

		try {
			const { frontmatter, body } = parseFrontmatter(rawContent);
			const slug = getSlugFromFilename(file);

			posts.push({
				filePath,
				slug,
				frontmatter,
				content: body,
				rawContent,
			});
		} catch (error) {
			console.error(`Error parsing ${file}:`, error);
		}
	}

	// Sort by publish date (newest first)
	posts.sort((a, b) => {
		const dateA = new Date(a.frontmatter.publishDate);
		const dateB = new Date(b.frontmatter.publishDate);
		return dateB.getTime() - dateA.getTime();
	});

	return posts.slice(0, limit);
}

function stripMarkdownForText(markdown: string): string {
	return markdown
		.replace(/#{1,6}\s/g, "") // Remove headers
		.replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
		.replace(/\*([^*]+)\*/g, "$1") // Remove italic
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
		.replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks
		.replace(/`([^`]+)`/g, "$1") // Remove inline code formatting
		.replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
		.replace(/\n{3,}/g, "\n\n") // Normalize multiple newlines
		.trim();
}

function updateFrontmatterWithAtUri(rawContent: string, atUri: string): string {
	// Insert atUri before the closing ---
	const frontmatterEndIndex = rawContent.indexOf("---", 4);
	if (frontmatterEndIndex === -1) {
		throw new Error("Could not find frontmatter end");
	}

	const beforeEnd = rawContent.slice(0, frontmatterEndIndex);
	const afterEnd = rawContent.slice(frontmatterEndIndex);

	return `${beforeEnd}atUri: "${atUri}"\n${afterEnd}`;
}

async function createAtProtoDocument(
	agent: AtpAgent,
	post: BlogPost,
): Promise<string> {
	const postPath = `/posts/${post.slug}`;
	const markdownContent = {
		$type: "site.standard.content.markdown",
		markdown: post.content.trim(),
	};

	const textContent = stripMarkdownForText(post.content);

	// Parse the publish date
	const publishDate = new Date(post.frontmatter.publishDate);

	const record = {
		$type: "site.standard.document",
		title: post.frontmatter.title,
		site: PUBLICATION_URI,
		path: postPath,
		content: markdownContent,
		coverImage: post.frontmatter.ogImage,
		textContent: textContent.slice(0, 10000), // Limit text content length
		publishedAt: publishDate.toISOString(),
		canonicalUrl: `${SITE_URL}${postPath}`,
		location: "main-blog",
	};

	const response = await agent.com.atproto.repo.createRecord({
		repo: agent.session!.did,
		collection: "site.standard.document",
		record,
	});

	return response.data.uri;
}

async function updateAtProtoDocument(
	agent: AtpAgent,
	post: BlogPost,
	atUri: string,
): Promise<void> {
	// Parse the atUri to get the repo, collection, and rkey
	// Format: at://did:plc:xxx/collection/rkey
	const uriMatch = atUri.match(/^at:\/\/([^/]+)\/([^/]+)\/(.+)$/);
	if (!uriMatch) {
		throw new Error(`Invalid atUri format: ${atUri}`);
	}

	const [, repo, collection, rkey] = uriMatch;

	const postPath = `/posts/${post.slug}`;
	const markdownContent = {
		$type: "site.standard.content.markdown",
		markdown: post.content.trim(),
	};

	const textContent = stripMarkdownForText(post.content);

	// Parse the publish date
	const publishDate = new Date(post.frontmatter.publishDate);

	const record = {
		$type: "site.standard.document",
		title: post.frontmatter.title,
		site: PUBLICATION_URI,
		path: postPath,
		content: markdownContent,
		coverImage: post.frontmatter.ogImage,
		textContent: textContent.slice(0, 10000), // Limit text content length
		publishedAt: publishDate.toISOString(),
		canonicalUrl: `${SITE_URL}${postPath}`,
		location: "main-blog",
	};

	await agent.com.atproto.repo.putRecord({
		repo: agent.session!.did,
		collection,
		rkey,
		record,
	});
}

async function main() {
	// Check for required environment variables
	const identifier = process.env.ATP_IDENTIFIER;
	const password = process.env.ATP_APP_PASSWORD;

	if (!identifier || !password) {
		console.error("Error: ATP_IDENTIFIER and ATP_APP_PASSWORD must be set");
		console.error("Example:");
		console.error(
			'  ATP_IDENTIFIER="your-handle.bsky.social" ATP_APP_PASSWORD="your-app-password" bun run scripts/publish-to-atproto.ts',
		);
		process.exit(1);
	}

	console.log(`Connecting to PDS at ${PDS_URL}...`);

	const agent = new AtpAgent({ service: PDS_URL });

	try {
		await agent.login({
			identifier,
			password,
		});
		console.log(`Logged in as ${agent.session?.handle}`);
	} catch (error) {
		console.error("Failed to login:", error);
		process.exit(1);
	}

	console.log("\nFetching recent posts...");
	const posts = await getRecentPosts(1);

	console.log(`Found ${posts.length} recent posts\n`);

	let publishedCount = 0;
	let updatedCount = 0;
	let skippedCount = 0;

	for (const post of posts) {
		console.log(`Processing: ${post.frontmatter.title}`);

		if (post.frontmatter.hidden) {
			console.log(`  - Post is hidden, skipping\n`);
			skippedCount++;
			continue;
		}

		try {
			if (post.frontmatter.atUri) {
				console.log(`  - Found existing atUri, updating document...`);
				await updateAtProtoDocument(agent, post, post.frontmatter.atUri);
				console.log(`  - Updated: ${post.frontmatter.atUri}\n`);
				updatedCount++;
			} else {
				console.log(`  - Creating ATProto document...`);
				const atUri = await createAtProtoDocument(agent, post);
				console.log(`  - Created: ${atUri}`);

				// Update the file with the new atUri
				const updatedContent = updateFrontmatterWithAtUri(
					post.rawContent,
					atUri,
				);
				fs.writeFileSync(post.filePath, updatedContent);
				console.log(
					`  - Updated frontmatter in ${path.basename(post.filePath)}\n`,
				);

				publishedCount++;
			}
		} catch (error) {
			console.error(`  - Error publishing: ${error}\n`);
		}
	}

	console.log("---");
	console.log(`Published: ${publishedCount}`);
	console.log(`Updated: ${updatedCount}`);
	console.log(`Skipped: ${skippedCount}`);
}

main();
