import type { ImageMetadata } from "astro";
import savage from "@/assets/the-savage-state.jpg";
import pastoral from "@/assets/the-pastoral-state.jpg";
import consumation from "@/assets/the-consumation-of-empire.jpg";
import destruction from "@/assets/destruction.jpg";
import desolation from "@/assets/desolation.jpg";

export interface Detail {
	x: number;
	y: number;
	scale: number;
	caption: string;
}

export interface Painting {
	slug: string;
	src: ImageMetadata;
	title: string;
	year: string;
	intro: string;
	link: string;
	details: Detail[];
}

export const paintings: Painting[] = [
	{
		slug: "savage",
		src: savage,
		title: "The Savage State",
		year: "1834",
		intro:
			"Dawn breaks over a wilderness as nomadic hunters chase a wounded deer and storm clouds wreathe the mountain. Nature is supreme; man clings to its edges.",
		link: "https://explorethomascole.org/project/the-savage-state/",
		details: [
			{
				x: 0.28,
				y: 0.73,
				scale: 2.7,
				caption: "A hunter draws his bow. Skins, not stone — the only architecture is the chase.",
			},
			{
				x: 0.95,
				y: 0.40,
				scale: 2.2,
				caption: "Storm wreathes the peak. The mountain will outlast every empire to come.",
			},
			{
				x: 1.50,
				y: 0.50,
				scale: 2.6,
				caption: "Smoke from a clustered camp at the shore. The first faint claim on the land.",
			},
		],
	},
	{
		slug: "pastoral",
		src: pastoral,
		title: "The Pastoral or Arcadian State",
		year: "1834",
		intro:
			"Morning light, cleared fields, a Stonehenge-like temple, an old man tracing geometry in the dirt while a boy sketches a figure on stone. Civilization stirs; agriculture, science, art, all still close to the earth.",
		link: "https://explorethomascole.org/project/the-arcadian-or-pastoral-state/"
,
		details: [
			{
				x: 0.15,
				y: 0.90,
				scale: 2.6,
				caption: "An old man traces geometry in the dirt. Knowledge begins as scratched lines.",
			},
			{
				x: 0.6,
				y: 0.45,
				scale: 2.2,
				caption: "A trilithon temple on the rise. Ritual housed in stone for the first time.",
			},
			{
				x: 1.20,
				y: 0.7,
				scale: 2.5,
				caption: "Shepherds and a circle of dancers. Labor and leisure still share a field.",
			},
		],
	},
	{
		slug: "consummation",
		src: consumation,
		title: "The Consummation of Empire",
		year: "1836",
		intro:
			"High noon over a marble city. A triumphant ruler crosses the bridge in an elephant-drawn car, temples crowd the bay, the harbor brims with ships. Splendor so total it can only precede collapse.",
		link: "https://explorethomascole.org/project/the-consummation-of-empire/"
,
		details: [
			{
				x: 0.3,
				y: 0.70,
				scale: 2.6,
				caption: "The conqueror crosses the bridge in an elephant-drawn car. Power on parade.",
			},
			{
				x: 0.18,
				y: 0.4,
				scale: 2.3,
				caption: "Colonnades march to the water. Marble built to outlast the men who quarried it.",
			},
			{
				x: 0.82,
				y: 0.78,
				scale: 2.4,
				caption: "The harbor packed with galleys. Trade has become indistinguishable from triumph.",
			},
		],
	},
	{
		slug: "destruction",
		src: destruction,
		title: "Destruction",
		year: "1836",
		intro:
			"Storm and sack. Invaders pour through the gates, the temple porch becomes a catapult, ships burn in the harbor, a headless warrior presides over the slaughter as the sky turns to fire.",
		link: "https://explorethomascole.org/project/destruction/",
		details: [
			{
				x: 0.42,
				y: 0.58,
				scale: 2.6,
				caption: "The headless warrior. Even the colossus loses its face when the city falls.",
			},
			{
				x: 0.7,
				y: 0.75,
				scale: 2.5,
				caption: "Bridge collapses under the press of bodies. Architecture eats its makers.",
			},
			{
				x: 0.2,
				y: 0.35,
				scale: 2.2,
				caption: "Sky turns to fire. The same harbor — only the light has changed.",
			},
		],
	},
	{
		slug: "desolation",
		src: desolation,
		title: "Desolation",
		year: "1836",
		intro:
			"Sunset and moonrise over silent ruins. Vines climb a lone column, a bird nests where a temple stood, deer roam the broken friezes. No human figures remain. Nature outlasts everything man builds.",
		link: "https://explorethomascole.org/project/desolation/",
		details: [
			{
				x: 0.28,
				y: 0.5,
				scale: 2.5,
				caption: "A single column, ivy-wrapped. The last vertical line man left standing.",
			},
			{
				x: 0.68,
				y: 0.78,
				scale: 2.4,
				caption: "Deer cross the broken frieze. The wilderness has come back through the gate.",
			},
			{
				x: 0.55,
				y: 0.32,
				scale: 2.2,
				caption: "Moonrise where the temple stood. The mountain unchanged across all five.",
			},
		],
	},
];
