import "dotenv/config"; // must stay first so env vars exist before the other modules load
import express from "express";
import cors from "cors";
import events from "./routes/events.js";
import manage from "./routes/manage.js";
import joins from "./routes/joins.js";

const { CLIENT_URL = "http://localhost:3000", PORT = 5000 } = process.env;

const app = express();
app.use(cors({ origin: CLIENT_URL.split(",") }));
app.use(express.json());

app.get("/", (_, res) => res.json({ ok: true, name: "Pashe API" }));
app.use(events, manage, joins);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error. Please try again." });
});

if (!process.env.VERCEL) app.listen(PORT, () => console.log(`Pashe API running on :${PORT}`));
export default app;
