import { Hono } from "hono";
import { cors } from "hono/cors";
import { home, now, auth } from "./routes";

interface Env {
	SESSIONS: KVNamespace;
	ALLOWED_DID: string;
	PDS_URL: string;
	CLIENT_URL: string;
	API_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use(cors());
app.route("/", home);
app.route("/now", now);
app.route("/auth", auth);

export default app;
