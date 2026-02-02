import { Hono } from "hono";
import { cors } from "hono/cors";
// COMMENTS FUNCTIONALITY DISABLED
// import { home, now, auth, guestAuth } from "./routes";
import { home, now, auth } from "./routes";

interface Env {
	SESSIONS: KVNamespace;
	ALLOWED_DID: string;
	PDS_URL: string;
	CLIENT_URL: string;
	API_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// Configure CORS to allow credentials from the client
app.use(
	cors({
		origin: (origin) => {
			const allowedOrigins = [
				"https://stevedylan.dev",
				"http://localhost:4321",
				"http://localhost:3000",
			];
			return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
		},
		credentials: true,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type"],
	}),
);

app.route("/", home);
app.route("/now", now);
app.route("/auth", auth);
// COMMENTS FUNCTIONALITY DISABLED
// app.route("/guest-auth", guestAuth);

export default app;
