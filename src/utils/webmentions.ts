export interface Mention {
	source: string;
	target: string;
	verifiedAt: string;
}

const PREFIX = "mention:";

// KV keys group mentions by target so they can be listed for a given page.
export function mentionKey(target: string, source: string): string {
	return `${PREFIX}${encodeURIComponent(target)}:${encodeURIComponent(source)}`;
}

// List stored mentions, optionally scoped to a single target page.
export async function readMentions(
	kv: KVNamespace,
	target?: string,
): Promise<Mention[]> {
	const prefix = target ? `${PREFIX}${encodeURIComponent(target)}:` : PREFIX;
	const { keys } = await kv.list({ prefix });
	const values = await Promise.all(keys.map((k) => kv.get(k.name)));
	return values
		.filter((v): v is string => v !== null)
		.map((v) => JSON.parse(v) as Mention);
}
