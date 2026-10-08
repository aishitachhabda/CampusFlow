import { useState } from "react";
import { CalendarDays, Clock3, Sparkles, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

const resources = ["Canteen", "Amul", "Snackify", "Nescafe"];

export default function PlanVisit() {
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);

  const [resource, setResource] = useState("Canteen");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("14:30");
  const [future, setFuture] = useState(null);
  const [best, setBest] = useState([]);
  const [loading, setLoading] = useState(false);

  async function predict() {
    setLoading(true);

    try {
      const requested = `${date}T${time}`;
      const res = await api.get("/predictions/forecast", {
        params: { resource, time: requested }
      });

      setFuture(res.data);
    } catch (e) {
      alert(e.response?.data?.message || "Could not get prediction.");
    } finally {
      setLoading(false);
    }
  }

  async function bestTimes() {
    try {
      const res = await api.get("/predictions/best-times", {
        params: { resource, date }
      });

      setBest(res.data.results);
    } catch (e) {
      alert(e.response?.data?.message || "Could not find best times.");
    }
  }

  return (
    <div className="page narrow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">PLAN AHEAD</span>
          <h1>Should I go at that time?</h1>
          <p>Pick a place and time. We’ll estimate the crowd.</p>
        </div>
      </div>

      <section className="planner-card">
        <div className="planner-heading">
          <div className="resource-icon"><Sparkles size={18} /></div>
          <div>
            <h2>Future crowd check</h2>
            <p>Ask the model about a specific time.</p>
          </div>
        </div>

        <div className="form-grid">
          <label>
            <span>Location</span>
            <select
              className="select"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
            >
              {resources.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>

          <label>
            <span>Date</span>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label>
            <span>Time</span>
            <input
              className="input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>

        <button
          className="primary-button"
          onClick={predict}
          disabled={loading}
        >
          <Clock3 size={17} />
          {loading ? "Checking..." : "Check this time"}
        </button>
      </section>

      {future && (
        <section className="future-result">
          <div>
            <span className="eyebrow">FORECAST</span>
            <h2>
              {new Date(future.requestedTime).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </h2>
            <p>{future.resource}</p>
          </div>

          <div className="future-right">
            <StatusBadge status={future.status} />
            <div className="forecast-score">{future.score}%</div>
            <strong>{future.recommendation}</strong>
          </div>
        </section>
      )}

      <section className="best-time-card">
        <div className="section-title">
          <div>
            <h2>Find a better time</h2>
            <p>Lowest predicted crowd windows for {resource}.</p>
          </div>

          <button className="secondary-button" onClick={bestTimes}>
            <Sparkles size={16} /> Find best times
          </button>
        </div>

        {best.length > 0 && (
          <div className="time-list">
            {best.map((item) => (
              <div className="time-row" key={item.time}>
                <div>
                  <strong>
                    {new Date(item.time).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </strong>
                  <span>{item.recommendation}</span>
                </div>

                <div className="time-status">
                  <StatusBadge status={item.status} />
                  <strong>{item.score}%</strong>
                  <ArrowRight size={15} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
