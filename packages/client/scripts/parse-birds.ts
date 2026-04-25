import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const csvPath = join(import.meta.dir, "../MyEBirdData.csv");
const outPath = join(import.meta.dir, "../src/data/birds.ts");

const csv = readFileSync(csvPath, "utf-8");
const lines = csv.trim().split("\n");
const headers = lines[0].split(",");

const idx = (name: string) => headers.indexOf(name);

const seen = new Set<string>();
const birds: { commonName: string; scientificName: string; date: string; location: string; state: string }[] = [];

for (const line of lines.slice(1)) {
	// Handle potential commas in quoted fields
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
	birds.push({ commonName, scientificName, date, location, state });
}

birds.sort((a, b) => a.commonName.localeCompare(b.commonName));

const ts = `export type BirdEntry = {
	commonName: string;
	scientificName: string;
	date: string;
	location: string;
	state: string;
};

export const birds: BirdEntry[] = ${JSON.stringify(birds, null, "\t")};
`;

writeFileSync(outPath, ts);
console.log(`Wrote ${birds.length} species to ${outPath}`);
