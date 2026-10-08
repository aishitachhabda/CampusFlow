import React from "react";
import { useEffect, useState } from "react";
import { Users, LogIn, BrainCircuit, Activity } from "lucide-react";
import { api } from "../services/api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    async function load() {
      const [s, u, e, p] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/login-events"),
        api.get("/admin/prediction-activity")
      ]);

      setStats(s.data);
      setUsers(u.data.users);
      setEvents(e.data.events);
      setPredictions(p.data.predictions);
    }

    load().catch((e) => console.error(e));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">DEVELOPER CONSOLE</span>
          <h1>Who’s using CampusFlow?</h1>
          <p>Access, authentication and prediction activity.</p>
        </div>
      </div>

      {stats && (
        <div className="admin-stats">
          <div><Users /><span>Total users</span><strong>{stats.totalUsers}</strong></div>
          <div><LogIn /><span>Total logins</span><strong>{stats.totalLogins}</strong></div>
          <div><Activity /><span>Today's logins</span><strong>{stats.todayLogins}</strong></div>
          <div><BrainCircuit /><span>Predictions</span><strong>{stats.totalPredictions}</strong></div>
        </div>
      )}

      <section className="admin-table-card">
        <div className="section-title">
          <div>
            <h2>Registered users</h2>
            <p>Accounts that have accessed the dashboard.</p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Logins</th>
                <th>Last login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.login_count}</td>
                  <td>{new Date(u.last_login_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-table-card">
        <div className="section-title">
          <div>
            <h2>Recent access events</h2>
            <p>Useful for demonstrating backend tracking.</p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Event</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.created_at).toLocaleString()}</td>
                  <td>{e.email || "Unknown"}</td>
                  <td>{e.event_type}</td>
                  <td>{e.ip_address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-table-card">
        <div className="section-title">
          <div>
            <h2>Prediction activity</h2>
            <p>Model requests recorded in MySQL.</p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Resource</th>
                <th>Type</th>
                <th>Status</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                  <td>{p.email || "Unknown"}</td>
                  <td>{p.resource_name}</td>
                  <td>{p.prediction_type}</td>
                  <td>{p.predicted_class || "—"}</td>
                  <td>{p.model_name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
