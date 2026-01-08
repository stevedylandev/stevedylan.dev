import { Hono } from "hono";

const home = new Hono();

home.get("/", (c) => {
	return c.text("Hello Hono!");
});

export default home;
