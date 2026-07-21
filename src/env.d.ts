/// <reference path="../.astro/types.d.ts" />

// Typed bindings for `import { env } from "cloudflare:workers"`
declare namespace Cloudflare {
	interface Env {
		SESSION: KVNamespace;
		WEBMENTIONS: KVNamespace;
	}
}
