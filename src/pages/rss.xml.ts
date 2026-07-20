import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import siteMeta from "@/site-config";

const parser = new MarkdownIt({ html: true, linkify: true });

const SITE = "https://stevedylan.dev";

// Resolve every blog image to its Astro-optimized URL (`/_astro/...` in a
// build, `/src/...` in dev). Keyed by filename so we can look them up from the
// relative paths used inside post markdown.
const imageUrls = import.meta.glob<string>(
	"../assets/blog-images/*.{png,jpg,jpeg,webp,gif,avif}",
	{ eager: true, query: "?url", import: "default" },
);

const urlByFilename = new Map<string, string>();
for (const [path, url] of Object.entries(imageUrls)) {
	const filename = path.split("/").pop();
	if (filename) urlByFilename.set(filename, url);
}

// Rewrite relative image srcs to absolute, optimized URLs so they render in
// RSS readers. Only applied to the feed — the site build keeps relative paths.
function absolutizeImages(html: string): string {
	return html.replace(
		/(<img\b[^>]*?\bsrc=")([^"]+)(")/gi,
		(match, pre, src, post) => {
			if (/^(https?:)?\/\//.test(src)) return match; // already absolute

			const filename = src.split(/[?#]/)[0].split("/").pop();
			const resolved = filename && urlByFilename.get(filename);
			if (resolved) return `${pre}${SITE}${resolved}${post}`;

			// Root-relative asset already served by the site.
			if (src.startsWith("/")) return `${pre}${SITE}${src}${post}`;

			return match;
		},
	);
}

export async function GET() {
	const posts = await getCollection("post");
	const visiblePosts = posts.filter((post) => !post.data.hidden);

	return rss({
		title: siteMeta.title,
		description: siteMeta.description,
		site: SITE,
		items: visiblePosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `/posts/${post.id}`,
			content: absolutizeImages(
				sanitizeHtml(parser.render(post.body ?? ""), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			),
		})),
	});
}
