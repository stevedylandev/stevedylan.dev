import MarkdownIt from "markdown-it";
import { createHighlighterCore, type ThemeRegistrationRaw } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import darkmatter from "../../darkmatter.json";

const LANGS = [
	import("@shikijs/langs/javascript"),
	import("@shikijs/langs/typescript"),
	import("@shikijs/langs/jsx"),
	import("@shikijs/langs/tsx"),
	import("@shikijs/langs/python"),
	import("@shikijs/langs/bash"),
	import("@shikijs/langs/shellscript"),
	import("@shikijs/langs/json"),
	import("@shikijs/langs/html"),
	import("@shikijs/langs/css"),
	import("@shikijs/langs/rust"),
	import("@shikijs/langs/go"),
	import("@shikijs/langs/markdown"),
	import("@shikijs/langs/yaml"),
	import("@shikijs/langs/toml"),
	import("@shikijs/langs/lua"),
];

export async function createMarkdownRenderer(): Promise<MarkdownIt> {
	const highlighter = await createHighlighterCore({
		themes: [darkmatter as unknown as ThemeRegistrationRaw],
		langs: LANGS,
		engine: createJavaScriptRegexEngine(),
	});

	let md: MarkdownIt;

	md = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: true,
		highlight: (code, lang): string => {
			const loaded = highlighter.getLoadedLanguages();
			const resolvedLang =
				lang && loaded.includes(lang as never) ? lang : "text";
			try {
				return highlighter.codeToHtml(code, {
					lang: resolvedLang,
					theme: "Darkmatter",
				});
			} catch {
				return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
			}
		},
	});

	return md;
}
