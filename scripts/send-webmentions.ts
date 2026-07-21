/**
 * Webmention sender.
 *
 * Run after `bun run build`. Scans each built blog post for outbound links,
 * discovers each target's webmention endpoint, and POSTs source+target.
 *
 * State is kept in scripts/.webmention-sent.json so a given source->target
 * pair is only sent once (commit that file to persist across machines/CI).
 *
 * Usage: bun run scripts/send-webmentions.ts [--dry]
 */

import { Glob } from "bun";
import { join } from "node:path";

const SITE = "https://stevedylan.dev";
const SITE_HOST = "stevedylan.dev";
const POSTS_GLOB = "dist/client/posts/*/index.html";
const STATE_PATH = join(import.meta.dir, ".webmention-sent.json");
const DRY = process.argv.includes("--dry");

type SentState = Record<string, string>; // "source|target" -> ISO timestamp

async function loadState(): Promise<SentState> {
	const file = Bun.file(STATE_PATH);
	if (await file.exists()) return (await file.json()) as SentState;
	return {};
}

async function saveState(state: SentState): Promise<void> {
	await Bun.write(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

// Post URL for the source, derived from the built path:
// dist/client/posts/<slug>/index.html -> https://stevedylan.dev/posts/<slug>/
function sourceUrlFor(path: string): string {
	const slug = path.split("/posts/")[1].replace(/\/index\.html$/, "");
	return `${SITE}/posts/${slug}/`;
}

// Grab only the article body (between the prose container and the
// Webmentions section) so nav/header/footer links are ignored.
function extractArticle(html: string): string {
	const start = html.indexOf("prose-cactus");
	const end = html.indexOf('id="webmentions"');
	if (start === -1) return "";
	return html.slice(start, end === -1 ? undefined : end);
}

function extractTargets(articleHtml: string): string[] {
	const hrefs = new Set<string>();
	const re = /href="(https?:\/\/[^"]+)"/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(articleHtml)) !== null) {
		try {
			const url = new URL(m[1]);
			if (url.host === SITE_HOST) continue; // skip self-links
			url.hash = ""; // normalize away fragments
			hrefs.add(url.href);
		} catch {
			// ignore malformed URLs
		}
	}
	return [...hrefs];
}

// Discover a target's webmention endpoint via the Link header first, then a
// <link>/<a rel="webmention"> in the body. Returns absolute URL or null.
async function discoverEndpoint(target: string): Promise<string | null> {
	let res: Response;
	try {
		res = await fetch(target, {
			headers: { "user-agent": "stevedylan.dev-webmention-sender/1.0" },
			redirect: "follow",
		});
	} catch {
		return null;
	}
	if (!res.ok) return null;

	// 1. Link header: Link: <url>; rel="webmention"
	const linkHeader = res.headers.get("link");
	if (linkHeader) {
		const found = parseLinkHeader(linkHeader);
		if (found) return new URL(found, res.url).href;
	}

	// 2. HTML <link>/<a rel="webmention" href="...">
	const body = await res.text();
	const re =
		/<(?:link|a)[^>]+rel=["'][^"']*\bwebmention\b[^"']*["'][^>]*>/gi;
	const tag = re.exec(body);
	if (tag) {
		const href = /href=["']([^"']+)["']/i.exec(tag[0]);
		if (href) return new URL(href[1], res.url).href;
	}
	return null;
}

function parseLinkHeader(header: string): string | null {
	for (const part of header.split(",")) {
		const seg = part.trim();
		const relMatch = /rel=["']?([^"';]+)["']?/i.exec(seg);
		if (relMatch && /\bwebmention\b/i.test(relMatch[1])) {
			const urlMatch = /^<([^>]+)>/.exec(seg);
			if (urlMatch) return urlMatch[1];
		}
	}
	return null;
}

async function sendWebmention(
	endpoint: string,
	source: string,
	target: string,
): Promise<boolean> {
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"user-agent": "stevedylan.dev-webmention-sender/1.0",
		},
		body: new URLSearchParams({ source, target }).toString(),
	});
	return res.ok;
}

async function main() {
	const state = await loadState();
	let sent = 0;
	let skipped = 0;
	let noEndpoint = 0;

	for await (const path of new Glob(POSTS_GLOB).scan(".")) {
		const source = sourceUrlFor(path);
		const html = await Bun.file(path).text();
		const targets = extractTargets(extractArticle(html));

		for (const target of targets) {
			const key = `${source}|${target}`;
			if (state[key]) {
				skipped++;
				continue;
			}

			const endpoint = await discoverEndpoint(target);
			if (!endpoint) {
				noEndpoint++;
				continue;
			}

			if (DRY) {
				console.log(`[dry] would send ${source} -> ${target} @ ${endpoint}`);
				continue;
			}

			const ok = await sendWebmention(endpoint, source, target);
			if (ok) {
				state[key] = new Date().toISOString();
				sent++;
				console.log(`sent ${source} -> ${target}`);
			} else {
				console.warn(`failed ${source} -> ${target} @ ${endpoint}`);
			}
		}
	}

	if (!DRY) await saveState(state);
	console.log(
		`\nDone. sent=${sent} skipped=${skipped} no-endpoint=${noEndpoint}`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
