import React from "react";
import { LogOut, ShieldCheck, Sparkles } from "lucide-react";

export default function Topbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={17} />
        </div>
        <div>
          <strong>CampusFlow</strong>
          <span>Campus resource intelligence</span>
        </div>
      </div>

      <div className="topbar-user">
        {user?.profilePicture && (
          <img src={user.profilePicture} alt="" className="avatar" />
        )}
        <div className="user-copy">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>

        {user?.role === "admin" && (
          <span className="admin-pill">
            <ShieldCheck size={14} /> Developer
          </span>
        )}

        <button className="icon-button" onClick={onLogout} title="Logout">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
