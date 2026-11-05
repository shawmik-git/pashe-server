# Pashe API
**Live API:** https://pashe-server.vercel.app
**Live site:** https://pashe-client.vercel.app
**Client repo:** https://github.com/shawmik-git/pashe-client

Express + MongoDB server for **Pashe**, a community-service events platform.

Protected routes verify the JWT that Better Auth issues on the client (via its JWKS endpoint), so the creator's email always comes from the token.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/events?limit=&type=&search=` | no | Upcoming events, soonest first |
| GET | `/events/:id` | no | One event |
| POST | `/events` | yes | Create an event (future date only) |
| GET | `/my-events` | yes | Events created by the user |
| PUT | `/events/:id` | yes, owner | Update an event |
| DELETE | `/events/:id` | yes, owner | Delete an event and its joins |
| POST | `/events/:id/join` | yes | Join an event (one join per user) |
| GET | `/events/:id/joined` | yes | Has the user joined? |
| GET | `/joined-events` | yes | Events the user joined, by date |

## Run

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

Deploy on Render (start command `npm start`) or Vercel. Set the same env vars there.
