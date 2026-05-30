import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import siteMeta from "@/site-config";

const parser = new MarkdownIt({ html: true, linkify: true });

export async function GET() {
	const posts = await getCollection("post");
	const visiblePosts = posts.filter((post) => !post.data.hidden);

	return rss({
		title: siteMeta.title,
		description: siteMeta.description,
		site: "https://stevedylan.dev",
		items: visiblePosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `/posts/${post.id}`,
			content: sanitizeHtml(parser.render(post.body ?? ""), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			}),
		})),
	});
}
