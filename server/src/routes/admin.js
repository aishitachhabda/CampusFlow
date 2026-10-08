import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { pool } from "../db.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", async (req, res) => {
  const [[users]] = await pool.query(
    "SELECT COUNT(*) AS totalUsers FROM users"
  );

  const [[logins]] = await pool.query(
    "SELECT COUNT(*) AS totalLogins FROM login_events"
  );

  const [[predictions]] = await pool.query(
    "SELECT COUNT(*) AS totalPredictions FROM prediction_logs"
  );

  const [[today]] = await pool.query(
    `SELECT COUNT(*) AS todayLogins
     FROM login_events
     WHERE DATE(created_at) = CURDATE()`
  );

  res.json({
    totalUsers: Number(users.totalUsers),
    totalLogins: Number(logins.totalLogins),
    totalPredictions: Number(predictions.totalPredictions),
    todayLogins: Number(today.todayLogins)
  });
});

router.get("/users", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, role,
            first_login_at, last_login_at, login_count
     FROM users
     ORDER BY last_login_at DESC
     LIMIT 200`
  );

  res.json({ users: rows });
});

router.get("/login-events", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT e.id, e.event_type, e.ip_address,
            e.user_agent, e.created_at,
            u.name, u.email
     FROM login_events e
     LEFT JOIN users u ON u.id = e.user_id
     ORDER BY e.created_at DESC
     LIMIT 200`
  );

  res.json({ events: rows });
});

router.get("/prediction-activity", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.resource_name, p.prediction_type,
            p.requested_time, p.predicted_score,
            p.predicted_class, p.confidence,
            p.model_name, p.created_at,
            u.name, u.email
     FROM prediction_logs p
     LEFT JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT 200`
  );

  res.json({ predictions: rows });
});

export default router;
