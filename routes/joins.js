import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../authMiddleware.js";
import { oid } from "../validate.js";

const router = Router();

router.post("/events/:id/join", requireAuth, async (req, res) => {
  const d = await db();
  const _id = oid(req.params.id);
  const ev = _id && (await d.collection("events").findOne({ _id }));
  if (!ev) return res.status(404).json({ message: "Event not found." });
  if (ev.eventDate <= new Date()) return res.status(400).json({ message: "This event has already ended." });
  try {
    await d.collection("joins").insertOne({
      eventId: _id,
      userEmail: req.user.email,
      userName: req.user.name,
      userImage: req.user.image ?? null,
      joinedAt: new Date(),
    });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "You have already joined this event." });
    throw e;
  }
  await d.collection("events").updateOne({ _id }, { $inc: { participants: 1 } });
  res.status(201).json({ joined: true });
});

router.get("/events/:id/joined", requireAuth, async (req, res) => {
  const _id = oid(req.params.id);
  const hit = _id && (await (await db()).collection("joins").findOne({ eventId: _id, userEmail: req.user.email }));
  res.json({ joined: !!hit });
});

// Events the user joined, soonest first.
router.get("/joined-events", requireAuth, async (req, res) =>
  res.json(
    await (await db())
      .collection("joins")
      .aggregate([
        { $match: { userEmail: req.user.email } },
        { $lookup: { from: "events", localField: "eventId", foreignField: "_id", as: "event" } },
        { $unwind: "$event" },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$event", { joinedAt: "$joinedAt" }] } } },
        { $sort: { eventDate: 1 } },
      ])
      .toArray()
  )
);

export default router;
