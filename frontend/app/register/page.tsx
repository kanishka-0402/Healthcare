"use client";

import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully! You can now log in.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(
        "Server se connection nahi ho pa raha. Backend check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-register-page">
      <section className="auth-register-hero">
        <div className="auth-register-brand">
          <div className="auth-register-brand-icon">✚</div>
          <span>HealthCare</span>
        </div>

        <div className="auth-register-hero-content">
          <span className="auth-register-eyebrow">
            YOUR WELLNESS, OUR COMMITMENT
          </span>

          <h1>
            Better care.
            <br />
            Healthier living.
          </h1>

          <p>
            Your healthcare journey, made simpler. Manage appointments,
            access medical reports, and keep your health information
            organized in one secure place.
          </p>

          <div className="auth-register-benefits">
            <div className="auth-register-benefit">
              <span>✓</span>
              <p>Easy appointment management</p>
            </div>

            <div className="auth-register-benefit">
              <span>✓</span>
              <p>Your medical information in one place</p>
            </div>

            <div className="auth-register-benefit">
              <span>✓</span>
              <p>A simpler healthcare experience</p>
            </div>
          </div>
        </div>

        <p className="auth-register-hero-footer">
          Care that puts you first.
        </p>
      </section>

      <section className="auth-register-form-section">
        <div className="auth-register-form-card">
          <div className="auth-register-mobile-brand">
            <div className="auth-register-brand-icon">✚</div>
            <span>HealthCare</span>
          </div>

          <div className="auth-register-heading">
            <span className="auth-register-step">GET STARTED</span>
            <h2>Create your account</h2>
            <p>
              Join HealthCare and manage your health with confidence.
            </p>
          </div>

          <form
            className="auth-register-form"
            onSubmit={handleRegister}
          >
            <div className="auth-register-field">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-register-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-register-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <small>Use at least 8 characters.</small>
            </div>

            <button
              className="auth-register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating your account..." : "Create Account"}
              {!loading && <span>→</span>}
            </button>
          </form>

          {message && (
            <p
              className={`auth-register-message ${
                message.startsWith("Account created")
                  ? "auth-register-success"
                  : "auth-register-error"
              }`}
              role="status"
            >
              {message}
            </p>
          )}

          <div className="auth-register-divider">
            <span>ALREADY A MEMBER?</span>
          </div>

          <p className="auth-register-login-text">
            Already have an account? <a href="/login">Log in</a>
          </p>

          <p className="auth-register-security">
            <span>♧</span> Your health journey deserves privacy and care.
          </p>
        </div>
      </section>
    </main>
  );
}
