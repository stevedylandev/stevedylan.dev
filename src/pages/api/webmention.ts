import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const ALLOWED_HOST = "stevedylan.dev";

interface StoredMention {
	source: string;
	target: string;
	verifiedAt: string;
}

function isValidHttpUrl(value: string): URL | null {
	try {
		const url = new URL(value);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		return url;
	} catch {
		return null;
	}
}

// KV key groups mentions by target so they can be listed for a given page.
function mentionKey(target: string, source: string): string {
	return `mention:${encodeURIComponent(target)}:${encodeURIComponent(source)}`;
}

// Fetch the source and confirm it actually links to the target, per the
// Webmention spec (https://www.w3.org/TR/webmention/#request-verification).
async function verifyAndStore(
	kv: KVNamespace,
	source: string,
	target: string,
): Promise<void> {
	const key = mentionKey(target, source);
	try {
		const res = await fetch(source, {
			headers: { "user-agent": "stevedylan.dev-webmention/1.0" },
			redirect: "follow",
		});
		if (!res.ok) {
			await kv.delete(key);
			return;
		}
		const body = await res.text();
		if (body.includes(target)) {
			const mention: StoredMention = {
				source,
				target,
				verifiedAt: new Date().toISOString(),
			};
			await kv.put(key, JSON.stringify(mention));
		} else {
			// Source no longer mentions the target — remove any prior record.
			await kv.delete(key);
		}
	} catch {
		await kv.delete(key);
	}
}

export const POST: APIRoute = async ({ request }) => {
	const contentType = request.headers.get("content-type") ?? "";
	if (!contentType.includes("application/x-www-form-urlencoded")) {
		return new Response("Content-Type must be application/x-www-form-urlencoded", {
			status: 400,
		});
	}

	const form = await request.formData();
	const source = form.get("source");
	const target = form.get("target");

	if (typeof source !== "string" || typeof target !== "string") {
		return new Response("Missing source or target", { status: 400 });
	}

	const sourceUrl = isValidHttpUrl(source);
	const targetUrl = isValidHttpUrl(target);
	if (!sourceUrl || !targetUrl) {
		return new Response("source and target must be valid http(s) URLs", {
			status: 400,
		});
	}

	if (sourceUrl.href === targetUrl.href) {
		return new Response("source and target must differ", { status: 400 });
	}

	if (targetUrl.host !== ALLOWED_HOST) {
		return new Response(`target must be on ${ALLOWED_HOST}`, { status: 400 });
	}

	const kv = env.WEBMENTIONS;

	// Verify the source links back, then store, before responding.
	await verifyAndStore(kv, sourceUrl.href, targetUrl.href);

	return new Response("Webmention accepted", { status: 201 });
};

// Read endpoint: list verified mentions for a given ?target= page.
export const GET: APIRoute = async ({ url }) => {
	const target = url.searchParams.get("target");
	const kv = env.WEBMENTIONS;

	const prefix = target
		? `mention:${encodeURIComponent(target)}:`
		: "mention:";
	const list = await kv.list({ prefix });

	const mentions: StoredMention[] = [];
	for (const entry of list.keys) {
		const value = await kv.get(entry.name);
		if (value) mentions.push(JSON.parse(value) as StoredMention);
	}

	return new Response(JSON.stringify({ mentions }), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
};
