import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { fileURLToPath } from "url";
import path from "path";

// https://astro.build/config
export default defineConfig({
	site: "https://stevedylan.dev",
	outDir: "dist",
	compressHTML: true,
	markdown: {
		shikiConfig: {
			theme: "vesper",
			wrap: false,
		},
	},
	prefetch: true,
	integrations: [
		mdx({}),
		tailwind({
			config: {
				applyBaseStyles: false,
			},
		}),
		sitemap(),
		react(),
	],
	vite: {
		resolve: {
			alias: {
				"@/components": path.resolve(
					path.dirname(fileURLToPath(import.meta.url)),
					"./src/components",
				),
				"@/layouts": path.resolve(
					path.dirname(fileURLToPath(import.meta.url)),
					"./src/layouts",
				),
				"@/utils": path.resolve(
					path.dirname(fileURLToPath(import.meta.url)),
					"./src/utils/index.ts",
				),
				"@/stores": path.resolve(
					path.dirname(fileURLToPath(import.meta.url)),
					"./src/stores",
				),
				"@/data": path.resolve(
					path.dirname(fileURLToPath(import.meta.url)),
					"./src/data",
				),
			},
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
	adapter: cloudflare(),
});
