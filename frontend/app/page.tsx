
"use client";

import { useState } from "react";

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleRegister = async (): Promise<void> => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      setMessage(data.message || "Registration completed.");
    } catch {
      setMessage("Could not connect to the server.");
    }
  };

  return (
    <div className="register-page">
      <div className="healthcare-info">
        <h1>HealthCare</h1>
        <h2>Your Health, Our Priority</h2>
        <p>
          Manage appointments, medical reports and healthcare
          information in one secure place.
        </p>
      </div>

      <div className="register-box">
        <h1>Create Account</h1>
        <p>Register as a patient</p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button onClick={handleRegister}>Create Account</button>
        

        {message && <p>{message}</p>}

        <p className="login-text">
          Already have an account? <a href="/login">Login</a>
        </p>

       
      </div>
    </div>
  );
}