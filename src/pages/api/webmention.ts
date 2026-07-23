import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
	type Mention,
	mentionKey,
	readMentions,
} from "@/utils";

export const prerender = false;

const ALLOWED_HOST = "stevedylan.dev";

function parseHttpUrl(value: string): URL | null {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? url : null;
	} catch {
		return null;
	}
}

// Fetch the source and confirm it links to the target, per the Webmention spec
// (https://www.w3.org/TR/webmention/#request-verification). If it no longer
// mentions the target, remove any prior record.
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
		if (res.ok && (await res.text()).includes(target)) {
			const mention: Mention = {
				source,
				target,
				verifiedAt: new Date().toISOString(),
			};
			await kv.put(key, JSON.stringify(mention));
			return;
		}
	} catch {
		// fall through to delete
	}
	await kv.delete(key);
}

export const POST: APIRoute = async ({ request }) => {
	const contentType = request.headers.get("content-type") ?? "";
	if (!contentType.includes("application/x-www-form-urlencoded")) {
		return new Response(
			"Content-Type must be application/x-www-form-urlencoded",
			{
				status: 400,
			},
		);
	}

	const form = await request.formData();
	const source = parseHttpUrl(String(form.get("source") ?? ""));
	const target = parseHttpUrl(String(form.get("target") ?? ""));

	if (!source || !target) {
		return new Response("source and target must be valid http(s) URLs", {
			status: 400,
		});
	}
	if (source.href === target.href) {
		return new Response("source and target must differ", { status: 400 });
	}
	if (target.host !== ALLOWED_HOST) {
		return new Response(`target must be on ${ALLOWED_HOST}`, { status: 400 });
	}

	await verifyAndStore(env.WEBMENTIONS, source.href, target.href);
	return new Response("Webmention accepted", { status: 201 });
};

// List verified mentions, optionally scoped to a ?target= page.
export const GET: APIRoute = async ({ url }) => {
	const target = url.searchParams.get("target") ?? undefined;
	const mentions = await readMentions(env.WEBMENTIONS, target);
	return new Response(JSON.stringify({ mentions }), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
};
