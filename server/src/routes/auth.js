import express from "express";
import { loginWithGoogle } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

router.post("/google", async (req, res) => {
  console.log("=================================");
  console.log("GOOGLE LOGIN REQUEST RECEIVED");
  console.log("Credential received:", !!req.body?.credential);
  console.log("=================================");

  try {
    console.log("Starting Google authentication...");

    const result = await loginWithGoogle(
      req.body.credential,
      req
    );

    console.log("Google authentication SUCCESS");

    res.json(result);
  } catch (error) {
    console.error("Google auth error:", error);

    res.status(401).json({
      message: "Google authentication failed.",
      detail: error.message
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, email, name, profile_picture, role,
            first_login_at, last_login_at, login_count
     FROM users
     WHERE id = ?`,
    [req.user.id]
  );

  if (!rows.length) {
    return res.status(404).json({
      message: "User not found."
    });
  }

  res.json({ user: rows[0] });
});

export default router;