import React from "react";
import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw, Clock3, MapPin } from "lucide-react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/overview");
      setData(res.data.overview);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>What’s happening on campus?</h1>
          <p>Quick crowd signals for the places you actually use.</p>
        </div>

        <button className="secondary-button" onClick={load}>
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <section className="hero-card">
        <div>
          <span className="eyebrow light">TODAY'S QUICK TAKE</span>
          <h2>Check first. Then go.</h2>
          <p>
            Use a current image for an on-the-spot answer or plan
            around a future time.
          </p>
        </div>

        <div className="hero-stat">
          <Clock3 size={18} />
          <span>Real-time decision support</span>
        </div>
      </section>

      <div className="section-title">
        <div>
          <h2>Campus spots</h2>
          <p>Current estimated crowd level</p>
        </div>
        <span className="live-label"><span /> Live view</span>
      </div>

      <section className="resource-grid">
        {data.map((item) => (
          <article className="resource-card" key={item.resource}>
            <div className="resource-top">
              <div className="resource-icon">
                <MapPin size={18} />
              </div>
              <StatusBadge status={item.status} />
            </div>

            <h3>{item.resource}</h3>
            <p>{item.recommendation}</p>

            <div className="crowd-meter">
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span>{item.score}%</span>
            </div>

            <button
              className="text-button"
              onClick={() => window.location.href = "/plan"}
            >
              Plan a visit <ArrowUpRight size={15} />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
