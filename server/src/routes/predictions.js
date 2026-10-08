import express from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../db.js";
import {
  predictImage,
  predictFuture,
  getBestTimes
} from "../services/predictionService.js";

const router = express.Router();

const upload = multer({
  dest: path.resolve("uploads"),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

router.post(
  "/image",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required." });
      }

      const resource = req.body.resource || "Canteen";

      const prediction = await predictImage({ resource });

      await pool.query(
        `INSERT INTO prediction_logs
         (user_id, resource_name, prediction_type, image_filename,
          predicted_score, predicted_class, confidence,
          recommendation, model_name)
         VALUES (?, ?, 'image', ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          resource,
          req.file.filename,
          prediction.score,
          prediction.status,
          prediction.confidence,
          prediction.recommendation,
          prediction.model
        ]
      );

      res.json(prediction);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Image prediction failed.",
        detail: error.message
      });
    }
  }
);

router.get("/forecast", requireAuth, async (req, res) => {
  try {
    const { resource = "Canteen", time } = req.query;

    if (!time) {
      return res.status(400).json({ message: "time is required." });
    }

    const prediction = await predictFuture({
      resource,
      requestedTime: time
    });

    await pool.query(
      `INSERT INTO prediction_logs
       (user_id, resource_name, prediction_type,
        requested_time, predicted_score, predicted_class,
        recommendation, model_name)
       VALUES (?, ?, 'future_time', ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        resource,
        new Date(time),
        prediction.score,
        prediction.status,
        prediction.recommendation,
        prediction.model
      ]
    );

    res.json(prediction);
  } catch (error) {
    res.status(400).json({
      message: "Future prediction failed.",
      detail: error.message
    });
  }
});

router.get("/best-times", requireAuth, async (req, res) => {
  try {
    const { resource = "Canteen", date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required." });
    }

    const results = await getBestTimes({ resource, date });

    res.json({
      resource,
      date,
      results
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not calculate best times.",
      detail: error.message
    });
  }
});

export default router;
