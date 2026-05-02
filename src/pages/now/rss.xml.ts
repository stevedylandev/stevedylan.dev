import rss from "@astrojs/rss";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import { POSTS_API } from "@/data/constants";

export const prerender = false;

const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

interface Post {
	short_id: string;
	title: string | null;
	slug: string;
	published_date: string | null;
	meta_description: string | null;
	meta_image: string | null;
	canonical_url: string | null;
	lang: string;
	tags: string | null;
	content: string;
	created_at: string;
	updated_at: string;
}

interface PostsListResponse {
	posts: Post[];
}

export async function GET() {
	try {
		const response = await fetch(`${POSTS_API}/posts`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as PostsListResponse;

		const posts = (data.posts || []).slice().sort((a, b) => {
			const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
			const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
			return dateB - dateA;
		});

		const stripMarkdown = (text: string) =>
			sanitizeHtml(md.renderInline(text), {
				allowedTags: [],
				allowedAttributes: {},
			});

		const items = posts.map((post) => {
			const rawFallback = post.content
				? `${post.content.slice(0, 70)}...`
				: post.slug;
			const fallback = stripMarkdown(rawFallback);
			const htmlContent = md.render(post.content || post.title || "");
			const description = post.meta_description || post.title || fallback;

			return {
				title: post.title || fallback,
				description,
				pubDate: post.published_date
					? new Date(post.published_date)
					: new Date(0),
				link: `/now/${post.slug}`,
				content: sanitizeHtml(htmlContent, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		});

		return rss({
			title: "Steve's Updates",
			description:
				"Small updates from my life that don't quite fit into a blog",
			site: process.env.SITE_URL || "https://stevedylan.dev",
			items: items,
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);

		return rss({
			title: "Steve's Updates",
			description:
				"Small updates from my life that don't quite fit into a blog",
			site: process.env.SITE_URL || "https://stevedylan.dev",
			items: [],
		});
	}
}
