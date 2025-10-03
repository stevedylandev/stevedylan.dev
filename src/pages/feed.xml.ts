import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import siteMeta from "@/site-config";

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
			link: `/posts/${post.slug}`,
			content: post.body,
		})),
	});
}
