import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getOverview, resources } from "../services/predictionService.js";

const router = express.Router();

router.get("/overview", requireAuth, async (req, res) => {
  res.json({
    resources,
    overview: getOverview()
  });
});

export default router;
