import MarkdownIt from "markdown-it";
import { createHighlighter, type ThemeRegistrationRaw } from "shiki";
import darkmatter from "../../darkmatter.json";

export async function createMarkdownRenderer(): Promise<MarkdownIt> {
	const highlighter = await createHighlighter({
		themes: [darkmatter as unknown as ThemeRegistrationRaw],
		langs: [
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
		],
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
