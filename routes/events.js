import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../authMiddleware.js";
import { TYPES, esc, oid, validate } from "../validate.js";

const router = Router();

// Public: upcoming events only, soonest first. ?limit=6&type=Cleanup&search=mirpur
router.get("/events", async (req, res) => {
  const { type, search, limit } = req.query;
  const q = { eventDate: { $gte: new Date() } };
  if (TYPES.includes(type)) q.eventType = type;
  if (typeof search === "string" && search.trim()) {
    const r = new RegExp(esc(search.trim()), "i");
    q.$or = [{ title: r }, { location: r }];
  }
  const cursor = (await db()).collection("events").find(q).sort({ eventDate: 1 });
  const n = Math.min(parseInt(limit) || 0, 50);
  if (n) cursor.limit(n);
  res.json(await cursor.toArray());
});

router.get("/events/:id", async (req, res) => {
  const _id = oid(req.params.id);
  const ev = _id && (await (await db()).collection("events").findOne({ _id }));
  ev ? res.json(ev) : res.status(404).json({ message: "Event not found." });
});

router.post("/events", requireAuth, async (req, res) => {
  const { data, message } = validate(req.body);
  if (message) return res.status(400).json({ message });
  // Creator comes from the verified token, never from the request body.
  const doc = { ...data, creatorEmail: req.user.email, creatorName: req.user.name, participants: 0, createdAt: new Date() };
  const { insertedId } = await (await db()).collection("events").insertOne(doc);
  res.status(201).json({ ...doc, _id: insertedId });
});

export default router;
