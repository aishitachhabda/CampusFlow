import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Clock3,
  Shield,
  Sparkles
} from "lucide-react";

export default function Sidebar({ isAdmin }) {
  return (
    <aside className="sidebar">
      <div className="mobile-brand">
        <Sparkles size={16} /> CampusFlow
      </div>

      <nav>
        <NavLink to="/dashboard">
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>

        <NavLink to="/check-now">
          <Camera size={17} />
          Check now
        </NavLink>

        <NavLink to="/plan">
          <Clock3 size={17} />
          Plan a visit
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin">
            <Shield size={17} />
            Developer
          </NavLink>
        )}
      </nav>

      <div className="sidebar-note">
        <span>AI-powered</span>
        <p>
          Crowd insights designed for quick campus decisions.
        </p>
      </div>
    </aside>
  );
}
