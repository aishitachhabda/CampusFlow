/**
 * TEMPORARY MODEL ADAPTER
 *
 * This file lets the dashboard work before the real DL models are deployed.
 *
 * FINAL PROJECT:
 * Replace these functions with HTTP calls to your Python FastAPI model server:
 *
 * React -> Node/Express -> Python FastAPI -> LSTM/GRU/CNN -> Node -> React
 *
 * Expected real models:
 * 1. LSTM/GRU for historical/future crowd prediction.
 * 2. CNN/MobileNetV2 for current image classification.
 */

const resources = ["Canteen", "Amul", "Snackify", "Nescafe"];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function classFromScore(score) {
  if (score < 35) return "Free";
  if (score < 70) return "Moderate";
  return "Busy";
}

function recommendation(status) {
  if (status === "Free") {
    return "Good time to visit.";
  }
  if (status === "Moderate") {
    return "Okay to visit, but some waiting may occur.";
  }
  return "Likely busy. Consider visiting at another time.";
}

function deterministicScore(resource, hour) {
  const base = {
    Canteen: 62,
    Amul: 50,
    Snackify: 42,
    Nescafe: 35
  }[resource] ?? 45;

  const lunchPeak = 30 * Math.exp(-((hour - 13.2) ** 2) / 3);
  const morningPeak = 18 * Math.exp(-((hour - 10) ** 2) / 2);
  const eveningPeak = 20 * Math.exp(-((hour - 17) ** 2) / 3);

  return clamp(base + lunchPeak + morningPeak + eveningPeak - 45);
}

export function getOverview() {
  return resources.map((resource) => {
    const hour = new Date().getHours();
    const score = Math.round(deterministicScore(resource, hour));
    const status = classFromScore(score);

    return {
      resource,
      score,
      status,
      recommendation: recommendation(status),
      updatedAt: new Date().toISOString(),
      model: "DEMO_ADAPTER"
    };
  });
}

export async function predictImage({ resource }) {
  // Replace this with a real POST to your Python CNN service.
  const seed = deterministicScore(resource || "Canteen", new Date().getHours());
  const score = clamp(seed + (Math.random() * 14 - 7));
  const status = classFromScore(score);

  return {
    resource: resource || "Canteen",
    score: Number(score.toFixed(2)),
    status,
    confidence: Number((0.82 + Math.random() * 0.15).toFixed(4)),
    recommendation: recommendation(status),
    model: "MobileNetV2-DEMO"
  };
}

export async function predictFuture({ resource, requestedTime }) {
  const date = new Date(requestedTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid requested time.");
  }

  const score = clamp(
    deterministicScore(resource, date.getHours()) +
      (date.getDay() === 0 || date.getDay() === 6 ? -18 : 0)
  );

  const status = classFromScore(score);

  return {
    resource,
    requestedTime: date.toISOString(),
    score: Number(score.toFixed(2)),
    status,
    recommendation: recommendation(status),
    model: "LSTM/GRU-DEMO"
  };
}

export async function getBestTimes({ resource, date }) {
  const baseDate = new Date(date);
  if (Number.isNaN(baseDate.getTime())) {
    throw new Error("Invalid date.");
  }

  const candidates = [];

  for (let hour = 8; hour <= 19; hour++) {
    for (const minute of [0, 30]) {
      const d = new Date(baseDate);
      d.setHours(hour, minute, 0, 0);

      const score = clamp(
        deterministicScore(resource, hour) +
        (d.getDay() === 0 || d.getDay() === 6 ? -18 : 0)
      );

      candidates.push({
        time: d.toISOString(),
        score: Number(score.toFixed(2)),
        status: classFromScore(score)
      });
    }
  }

  return candidates
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      recommendation: recommendation(item.status)
    }));
}

export { resources };
