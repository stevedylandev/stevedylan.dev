import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import javascript from "@shikijs/langs/javascript";
import typescript from "@shikijs/langs/typescript";
import jsx from "@shikijs/langs/jsx";
import tsx from "@shikijs/langs/tsx";
import python from "@shikijs/langs/python";
import bash from "@shikijs/langs/bash";
import shellscript from "@shikijs/langs/shellscript";
import json from "@shikijs/langs/json";
import html from "@shikijs/langs/html";
import css from "@shikijs/langs/css";
import rust from "@shikijs/langs/rust";
import go from "@shikijs/langs/go";
import markdown from "@shikijs/langs/markdown";
import yaml from "@shikijs/langs/yaml";
import toml from "@shikijs/langs/toml";
import lua from "@shikijs/langs/lua";
import darkmatter from "./darkmatter.json" with { type: "json" };

export const LANGS = [
	javascript,
	typescript,
	jsx,
	tsx,
	python,
	bash,
	shellscript,
	json,
	html,
	css,
	rust,
	go,
	markdown,
	yaml,
	toml,
	lua,
];

export const THEME = darkmatter;
export const THEME_NAME = "Darkmatter";

export function createDarkmatterHighlighter() {
	return createHighlighterCoreSync({
		themes: [darkmatter],
		langs: LANGS,
		engine: createJavaScriptRegexEngine(),
	});
}
