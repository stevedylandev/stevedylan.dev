import MarkdownIt from "markdown-it";
import { createHighlighterCore, type ThemeRegistrationRaw } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki";
import darkmatter from "../../darkmatter.json";

const LANGS = [
	"javascript",
	"typescript",
	"jsx",
	"tsx",
	"python",
	"bash",
	"shell",
	"json",
	"html",
	"css",
	"rust",
	"go",
	"markdown",
	"yaml",
	"toml",
	"text",
	"lua",
] as const;

export async function createMarkdownRenderer(): Promise<MarkdownIt> {
	const highlighter = await createHighlighterCore({
		themes: [darkmatter as unknown as ThemeRegistrationRaw],
		langs: LANGS.map((l) => bundledLanguages[l]),
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
