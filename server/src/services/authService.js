import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function isAdminEmail(email) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(String(email).toLowerCase());
}

export async function loginWithGoogle(credential, req) {
  if (!credential) {
    throw new Error("Google credential is missing.");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error("Google account information is incomplete.");
  }

  const googleSub = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];
  const picture = payload.picture || null;
  const role = isAdminEmail(email) ? "admin" : "user";

  const [existing] = await pool.query(
    "SELECT * FROM users WHERE google_sub = ? OR email = ? LIMIT 1",
    [googleSub, email]
  );

  let user;

  if (existing.length === 0) {
    const [result] = await pool.query(
      `INSERT INTO users
       (google_sub, email, name, profile_picture, provider, role,
        first_login_at, last_login_at, login_count)
       VALUES (?, ?, ?, ?, 'google', ?, NOW(), NOW(), 1)`,
      [googleSub, email, name, picture, role]
    );

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );
    user = rows[0];
  } else {
    user = existing[0];

    await pool.query(
      `UPDATE users
       SET google_sub = ?, name = ?, profile_picture = ?,
           role = ?, last_login_at = NOW(), login_count = login_count + 1
       WHERE id = ?`,
      [googleSub, name, picture, role, user.id]
    );

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [user.id]
    );
    user = rows[0];
  }

  await pool.query(
    `INSERT INTO login_events
     (user_id, event_type, ip_address, user_agent)
     VALUES (?, 'login', ?, ?)`,
    [user.id, req.ip, req.headers["user-agent"] || null]
  );

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profilePicture: user.profile_picture,
      loginCount: user.login_count
    }
  };
}
