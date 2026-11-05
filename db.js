import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
let ready;

// Connects once and reuses the connection. A failed connect is retried on the next request.
export const db = () =>
  (ready ??= (async () => {
    await client.connect();
    const d = client.db(process.env.DB_NAME || "pashe");
    await d.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
    return d;
  })().catch((e) => {
    ready = undefined;
    throw e;
  }));
