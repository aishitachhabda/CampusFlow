import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { api, setAuthToken } from "./services/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CheckNow from "./pages/CheckNow";
import PlanVisit from "./pages/PlanVisit";
import Admin from "./pages/Admin";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";

function Shell({ user, onLogout }) {
  return (
    <div className="app-shell">
      <Topbar user={user} onLogout={onLogout} />

      <div className="body-shell">
        <Sidebar isAdmin={user.role === "admin"} />

        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/check-now" element={<CheckNow />} />
            <Route path="/plan" element={<PlanVisit />} />

            {user.role === "admin" && (
              <Route path="/admin" element={<Admin />} />
            )}

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthBridge />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

function AuthBridge() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check existing login
  useEffect(() => {
    const token = localStorage.getItem("campusflow_token");

    if (!token) {
      setChecking(false);
      return;
    }

    setAuthToken(token);

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("campusflow_token");
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  // Listen for Google login from Login.jsx
  useEffect(() => {
    async function loginFromGoogle(event) {
      try {
        console.log("Google credential received.");
        console.log("Sending credential to backend...");

        const res = await api.post("/auth/google", {
          credential: event.detail.credential,
        });

        console.log("Backend login successful!");

        localStorage.setItem(
          "campusflow_token",
          res.data.token
        );

        setAuthToken(res.data.token);
        setUser(res.data.user);

        navigate("/dashboard");
      } catch (error) {
        console.error("Backend login failed:", error);

        alert(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            "Login failed. Please try again."
        );
      }
    }

    window.addEventListener(
      "campusflow-login",
      loginFromGoogle
    );

    return () => {
      window.removeEventListener(
        "campusflow-login",
        loginFromGoogle
      );
    };
  }, [navigate]);

  function logout() {
    localStorage.removeItem("campusflow_token");
    setAuthToken(null);
    setUser(null);
    navigate("/login");
  }

  if (checking) {
    return (
      <div className="loading-screen">
        Loading CampusFlow…
      </div>
    );
  }

  return (
    <Routes>
      {/* LOGIN PAGE */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLogin={(response) => {
                console.log("Login.jsx received Google response.");

                window.dispatchEvent(
                  new CustomEvent("campusflow-login", {
                    detail: response,
                  })
                );
              }}
            />
          )
        }
      />

      {/* PROTECTED APPLICATION */}
      <Route
        path="/*"
        element={
          user ? (
            <Shell
              user={user}
              onLogout={logout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;