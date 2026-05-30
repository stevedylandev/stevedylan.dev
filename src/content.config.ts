import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const post = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().min(10).max(160),
			publishDate: z.string().transform((str) => new Date(str)),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			ogImage: z.union([image(), z.string().url()]).optional(),
			hidden: z.boolean().optional().default(false),
			atUri: z.string().optional(),
		}),
});

const pages = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
	schema: z
		.object({
			title: z.string().optional(),
		})
		.optional(),
});

export const collections = { post, pages };
