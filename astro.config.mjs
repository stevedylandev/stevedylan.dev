import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "url";
import path from "path";
import { createDarkmatterHighlighter, THEME_NAME } from "./scripts/shiki-setup.mjs";

const highlighter = createDarkmatterHighlighter();

const root = path.dirname(fileURLToPath(import.meta.url));
const emptyShikiTheme = path.resolve(root, "./scripts/empty-shiki-theme.mjs");

// https://astro.build/config
export default defineConfig({
	site: "https://stevedylan.dev",
	outDir: "dist",
	compressHTML: true,
	markdown: {
		syntaxHighlight: false,
		rehypePlugins: [
			[(opts) => rehypeShikiFromHighlighter(highlighter, opts), { theme: THEME_NAME, defaultLanguage: "text", fallbackLanguage: "text", addLanguageClass: true }],
			[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
		],
	},
	prefetch: true,
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: [
				{ find: /^@shikijs\/themes\/[^/]+$/, replacement: emptyShikiTheme },
				{ find: /^@shikijs\/themes\/dist\/.+\.mjs$/, replacement: emptyShikiTheme },
				{ find: "@/components", replacement: path.resolve(root, "./src/components") },
				{ find: "@/layouts", replacement: path.resolve(root, "./src/layouts") },
				{ find: "@/utils", replacement: path.resolve(root, "./src/utils/index.ts") },
				{ find: "@/stores", replacement: path.resolve(root, "./src/stores") },
				{ find: "@/data", replacement: path.resolve(root, "./src/data") },
			],
			extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".astro"],
		},
		ssr: {
			external: [
				"node:path",
				"node:fs",
				"node:fs/promises",
				"node:url",
				"node:http2",
				"node:buffer",
				"node:crypto",
				"path",
				"fs",
				"url",
				"os",
				"child_process",
				"crypto",
				"tty",
				"worker_threads",
			],
		},
	},
	output: "static",
	adapter: cloudflare({
    imageService: "compile"
  }),
});
