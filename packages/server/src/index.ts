import { Hono } from "hono";
import { cors } from "hono/cors";
import { home, now } from "./routes";

const app = new Hono();

app.use(cors());

app.route("/", home);
app.route("/now", now);

export default app;
