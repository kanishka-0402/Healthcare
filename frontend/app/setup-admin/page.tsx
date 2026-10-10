"use client";

import { useState } from "react";

export default function SetupAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/setup-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password,
            setupKey
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Admin setup failed.");
        return;
      }

      setMessage("Admin created successfully! Go to the login page and log in as Admin.");
      setName("");
      setEmail("");
      setPassword("");
      setSetupKey("");
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "440px", margin: "60px auto", padding: "24px" }}>
      <h1>Create Initial Admin</h1>
      <p>Use this page only for the initial admin account setup.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (at least 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <input
          type="password"
          placeholder="Admin setup key"
          value={setupKey}
          onChange={(e) => setSetupKey(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </main>
  );
}

