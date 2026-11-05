import { ObjectId } from "mongodb";

export const TYPES = ["Cleanup", "Plantation", "Donation", "Food Drive", "Blood Donation", "Health Camp", "Education", "Other"];

export const oid = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);
export const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isUrl = (s) => {
  try { return /^https?:$/.test(new URL(s).protocol); } catch { return false; }
};

// Returns { message } on the first problem, otherwise { data } with cleaned fields.
// keepDate: an existing event's date, which may stay unchanged even if it is now in the past.
export function validate(b = {}, keepDate) {
  const title = b.title?.trim(), description = b.description?.trim();
  const location = b.location?.trim(), thumbnail = b.thumbnail?.trim();
  const eventDate = new Date(b.eventDate);
  let message;
  if (!title || title.length < 5) message = "Title must be at least 5 characters.";
  else if (!description || description.length < 20) message = "Description must be at least 20 characters.";
  else if (!TYPES.includes(b.eventType)) message = "Choose a valid event type.";
  else if (!thumbnail || !isUrl(thumbnail)) message = "Thumbnail must be a valid image URL.";
  else if (!location || location.length < 3) message = "Enter the event location.";
  else if (isNaN(eventDate)) message = "Enter a valid event date.";
  else if (eventDate <= new Date() && eventDate.getTime() !== keepDate?.getTime()) message = "Event date must be in the future.";
  return message ? { message } : { data: { title, description, eventType: b.eventType, thumbnail, location, eventDate } };
}
