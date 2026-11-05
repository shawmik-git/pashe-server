import { createRemoteJWKSet, jwtVerify } from "jose";

const { AUTH_URL } = process.env;
// Better Auth publishes its public keys here; every JWT is verified against them.
const JWKS = createRemoteJWKSet(new URL(`${AUTH_URL}/api/auth/jwks`));

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { payload } = await jwtVerify(token, JWKS, { issuer: AUTH_URL, audience: AUTH_URL });
    req.user = payload; // { id, email, name, image, ... }
    next();
  } catch {
    res.status(401).json({ message: "Please log in to continue." });
  }
};
