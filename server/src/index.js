import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { testDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import predictionRoutes from "./routes/predictions.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: false
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CampusFlow API"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/admin", adminRoutes);

const PORT = Number(process.env.PORT || 5000);

testDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CampusFlow API running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MySQL:", error.message);
    process.exit(1);
  });
