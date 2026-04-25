import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const csvPath = join(import.meta.dir, "../MyEBirdData.csv");
const outPath = join(import.meta.dir, "../src/data/birds.ts");

const csv = readFileSync(csvPath, "utf-8");
const lines = csv.trim().split("\n");
const headers = lines[0].split(",");

const idx = (name: string) => headers.indexOf(name);

const seen = new Set<string>();
const birds: {
	commonName: string;
	scientificName: string;
	date: string;
	location: string;
	state: string;
	photo: string | null;
	summary: string | null;
	wikiUrl: string | null;
}[] = [];

for (const line of lines.slice(1)) {
	const cols: string[] = [];
	let inQuote = false;
	let cur = "";
	for (const ch of line) {
		if (ch === '"') { inQuote = !inQuote; }
		else if (ch === "," && !inQuote) { cols.push(cur); cur = ""; }
		else { cur += ch; }
	}
	cols.push(cur);

	const commonName = cols[idx("Common Name")]?.trim();
	const scientificName = cols[idx("Scientific Name")]?.trim();
	const date = cols[idx("Date")]?.trim();
	const location = cols[idx("Location")]?.trim();
	const state = cols[idx("State/Province")]?.trim();

	if (!commonName || seen.has(commonName)) continue;
	seen.add(commonName);
	birds.push({ commonName, scientificName, date, location, state, photo: null, summary: null, wikiUrl: null });
}

birds.sort((a, b) => a.commonName.localeCompare(b.commonName));

console.log(`Fetching iNaturalist data for ${birds.length} species...`);

for (const bird of birds) {
	const query = encodeURIComponent(bird.commonName);
	const url = `https://api.inaturalist.org/v1/taxa?q=${query}&rank=species&per_page=1`;
	try {
		const res = await fetch(url);
		if (res.ok) {
			const data = await res.json() as any;
			const taxon = data.results?.[0];
			if (taxon) {
				bird.photo = taxon.default_photo?.medium_url ?? null;
				const raw: string | null = taxon.wikipedia_summary ?? null;
				bird.summary = raw ? (raw.length > 220 ? raw.slice(0, 220).replace(/\s\S*$/, "") + "…" : raw) : null;
				bird.wikiUrl = taxon.wikipedia_url ?? null;
			}
		}
	} catch (e) {
		console.warn(`  Failed to fetch ${bird.commonName}: ${e}`);
	}
	console.log(`  ${bird.photo ? "✓" : "✗"} ${bird.commonName}`);
	await new Promise(r => setTimeout(r, 100));
}

const ts = `export type BirdEntry = {
	commonName: string;
	scientificName: string;
	date: string;
	location: string;
	state: string;
	photo: string | null;
	summary: string | null;
	wikiUrl: string | null;
};

export const birds: BirdEntry[] = ${JSON.stringify(birds, null, "\t")};
`;

writeFileSync(outPath, ts);
console.log(`\nWrote ${birds.length} species to ${outPath}`);
