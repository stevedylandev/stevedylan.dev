import { OWNER_DID } from "@/data/constants";

export const prerender = true;

const PUBLICATION_RKEY = "self";

export async function GET() {
	const atUri = `at://${OWNER_DID}/site.standard.publication/${PUBLICATION_RKEY}`;

	return new Response(atUri, {
		status: 200,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
