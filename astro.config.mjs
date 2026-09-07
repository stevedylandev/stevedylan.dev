import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
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

// The Cloudflare adapter's dev server runs on workerd, which ships glibc-only
// binaries and so can't start on musl/Alpine — it dies during dynamic linking
// ("Error relocating ...: fcntl64: symbol not found"), and Astro reports only
// "Dev server process exited before becoming ready." Drop the adapter in dev so
// Vite serves the SSR routes instead. Trade-off: routes reading Cloudflare
// bindings via `cloudflare:workers` (/webmentions, /api/webmention) 500 locally.
// Set ASTRO_CF_ADAPTER=1 to force the real runtime, e.g. inside a glibc container.
const skipAdapter =
	process.argv.includes("dev") && process.env.ASTRO_CF_ADAPTER !== "1";

// https://astro.build/config
export default defineConfig({
	site: "https://stevedylan.dev",
	outDir: "dist",
	compressHTML: true,
	// Webmention endpoint must accept cross-origin form POSTs; Astro's default
	// CSRF check (checkOrigin) would reject them with a 403.
	security: {
		checkOrigin: false,
	},
	image: {
    domains: ["kagifeedback.org", "api.iconify.design", "files.stevedylan.dev"],
	},
	markdown: {
		syntaxHighlight: false,
		processor: unified({
			rehypePlugins: [
				[(opts) => rehypeShikiFromHighlighter(highlighter, opts), { theme: THEME_NAME, defaultLanguage: "text", fallbackLanguage: "text", addLanguageClass: true }],
				[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
			],
		}),
	},
	prefetch: true,
	integrations: [mdx(), sitemap()],
	vite: {
    server: {
      allowedHosts: ["benson"]
    },
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
				{ find: "@/assets", replacement: path.resolve(root, "./src/assets") },
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
				"satteri",
				"@astrojs/markdown-satteri",
				"@napi-rs/wasm-runtime",
				"sharp",
			],
		},
		build: {
			rolldownOptions: {
				platform: "neutral",
				external: [
					"satteri",
					"@astrojs/markdown-satteri",
					"@napi-rs/wasm-runtime",
					"sharp",
				],
			},
		},
		optimizeDeps: {
			exclude: ["sharp"],
		},
	},
	output: "static",
	adapter: skipAdapter
		? undefined
		: cloudflare({
				imageService: "compile",
				prerenderEnvironment: "node",
			}),
});
