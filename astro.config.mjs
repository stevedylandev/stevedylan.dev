import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

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
		ssr: {
			external: ["node:async_hooks"],
		},
		define: {
			"process.env": process.env,
		},
	},
	output: "static",
});
