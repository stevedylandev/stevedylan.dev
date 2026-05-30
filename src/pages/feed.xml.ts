import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import sanitizeHtml from "sanitize-html";
import siteMeta from "@/site-config";

export async function GET() {
	const posts = await getCollection("post");
	const visiblePosts = posts.filter((post) => !post.data.hidden);

	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });

	const items = await Promise.all(
		visiblePosts.map(async (post) => {
			const { Content } = await render(post);
			const content = await container.renderToString(Content);

			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.publishDate,
				link: `/posts/${post.id}`,
				content: sanitizeHtml(content, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		}),
	);

	return rss({
		title: siteMeta.title,
		description: siteMeta.description,
		site: process.env.SITE_URL || "https://stevedylan.dev",
		items: items,
	});
}
