import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Sparkles, Camera, Clock3, BarChart3 } from "lucide-react";

export default function Login({ onLogin }) {
  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="hero-glow" />

        <div className="login-brand">
          <div className="brand-mark large">
            <Sparkles size={23} />
          </div>

          <div>
            <strong>CampusFlow</strong>
            <span>Know before you go.</span>
          </div>
        </div>

        <div className="hero-content">
          <span className="eyebrow">SMART CAMPUS ·</span>

          <h1>
            Spend less time
            <br />
            <em>waiting.</em>
          </h1>

          <p>
            Check the crowd now, predict what it will look like later,
            and choose a better time to visit.
          </p>

          <div className="feature-strip">
            <div>
              <Camera size={18} />
              <span>Live image check</span>
            </div>

            <div>
              <Clock3 size={18} />
              <span>Future crowd forecast</span>
            </div>

            <div>
              <BarChart3 size={18} />
              <span>Smart recommendations</span>
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <span>Designed for campus students</span>
          <span>·</span>
          <span>Deep Learning Lab 2026–27</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="small-label">WELCOME</div>

          <h2>Let's get you in.</h2>

          <p className="muted">
            Sign in with your Google account to use CampusFlow.
          </p>

          <div className="google-wrap">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log("Google login successful");
                console.log("Credential received:", credentialResponse);

                if (onLogin) {
                  onLogin(credentialResponse);
                }
              }}
              onError={() => {
                console.error("Google login failed");
                alert("Google login failed. Please try again.");
              }}
              theme="outline"
              shape="pill"
            />
          </div>

          <p className="privacy-copy">
            By continuing, your account email and access activity are
            recorded securely for application access management.
          </p>
        </div>
      </section>
    </main>
  );
}