export const prerender = true;

export async function GET() {
	// Your DID from PDSPost.tsx
	const DID = "did:plc:ia2zdnhjaokf5lazhxrmj6eu";

	// This should be the rkey of your actual site.standard.publication record
	// You'll need to create this record in your PDS first
	const PUBLICATION_RKEY = "self";

	const atUri = `at://${DID}/site.standard.publication/${PUBLICATION_RKEY}`;

	return new Response(atUri, {
		status: 200,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
