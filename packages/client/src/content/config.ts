import { z, defineCollection } from "astro:content";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const post = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string().min(10).max(160),
		publishDate: z.string().transform((str) => new Date(str)),
		tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
		ogImage: z.string().optional(),
		hidden: z.boolean().optional().default(false),
	}),
});

export const collections = { post };
