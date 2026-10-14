"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


type UserRole = "patient" | "doctor" | "admin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.token) {
        setMessage(data.message || "Login failed.");
        return;
      }

      const actualRole = data.user?.role || data.role;

      if (!actualRole) {
        setMessage(
          "Backend must return the user's role with the login response."
        );
        return;
      }

      if (actualRole !== role) {
        setMessage(`This account is registered as ${actualRole}. Please select the correct role.`);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", actualRole);

     if (actualRole === "patient") {
  router.push("/patient");
} else if (actualRole === "doctor") {
  router.push("/doctor");
} else if (actualRole === "admin") {
  router.push("/admin");
} else {
  setMessage("Invalid user role.");
}
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand">
            <div className="brand-icon">✚</div>
            <span>HealthCare</span>
          </div>

          <div className="welcome-content">
            <p className="small-heading">YOUR HEALTH, OUR PRIORITY</p>
            <h1>
              Welcome
              <br />
              <span>Back!</span>
            </h1>
            <p className="description">
              Access your healthcare dashboard, manage medical reports
              and stay connected with your healthcare team.
            </p>
          </div>

          <div className="secure-text">
            <span>🔒</span>
            <p>Your information is secure and protected</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Choose your account type to continue</p>
            </div>

            <div className="role-options">
              <button
                type="button"
                className={role === "patient" ? "role-button active" : "role-button"}
                onClick={() => setRole("patient")}
              >
                Patient
              </button>

              <button
                type="button"
                className={role === "doctor" ? "role-button active" : "role-button"}
                onClick={() => setRole("doctor")}
              >
                Doctor
              </button>

              <button
                type="button"
                className={role === "admin" ? "role-button active" : "role-button"}
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="login-button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : `Login as ${role}`}
              <span>→</span>
            </button>

            {message && <p role="status">{message}</p>}

            <p className="register-text">
              Don&apos;t have an account?{" "}
              <a href="/register">Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

