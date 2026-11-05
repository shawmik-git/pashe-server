import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware.js";
import { oid, validate } from "../validate.js";

const router = Router();

// Loads the event and makes sure the logged-in user created it.
async function ownEvent(req, res) {
  const _id = oid(req.params.id);
  const ev = _id && (await (await db()).collection("events").findOne({ _id }));
  if (!ev) return void res.status(404).json({ message: "Event not found." });
  if (ev.creatorEmail !== req.user.email) return void res.status(403).json({ message: "You can only change events you created." });
  return ev;
}

router.get("/my-events", requireAuth, async (req, res) =>
  res.json(await (await db()).collection("events").find({ creatorEmail: req.user.email }).sort({ eventDate: 1 }).toArray())
);

router.put("/events/:id", requireAuth, async (req, res) => {
  const ev = await ownEvent(req, res);
  if (!ev) return;
  const { data, message } = validate(req.body, ev.eventDate);
  if (message) return res.status(400).json({ message });
  await (await db()).collection("events").updateOne({ _id: ev._id }, { $set: data });
  res.json({ ...ev, ...data });
});

router.delete("/events/:id", requireAuth, async (req, res) => {
  const ev = await ownEvent(req, res);
  if (!ev) return;
  const d = await db();
  await d.collection("events").deleteOne({ _id: ev._id });
  await d.collection("joins").deleteMany({ eventId: ev._id });
  res.json({ deleted: true });
});

export default router;
