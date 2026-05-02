import MarkdownIt from "markdown-it";
import {
	createDarkmatterHighlighter,
	THEME_NAME,
} from "../../scripts/shiki-setup.mjs";

export async function createMarkdownRenderer(): Promise<MarkdownIt> {
	const highlighter = createDarkmatterHighlighter();

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
					theme: THEME_NAME,
				});
			} catch {
				return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
			}
		},
	});

	return md;
}
