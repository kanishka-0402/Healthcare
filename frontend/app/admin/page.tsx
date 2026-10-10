"use client";

import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in as admin.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load users.");
        setLoading(false);
        return;
      }

      setPatients(data.patients || []);
      setDoctors(data.doctors || []);
      setMessage("");
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateDoctor = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/admin/doctors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create doctor.");
        return;
      }

      setMessage("Doctor account created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      await fetchUsers();
    } catch {
      setMessage("Cannot connect to the backend.");
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">HEALTHCARE MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage patient and doctor accounts.</p>
        </div>
        <button
          className="admin-refresh"
          onClick={() => {
            setLoading(true);
            fetchUsers();
          }}
        >
          Refresh
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <section className="admin-stats">
        <div className="admin-stat-card">
          <span>Total Patients</span>
          <strong>{patients.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Total Doctors</span>
          <strong>{doctors.length}</strong>
        </div>
      </section>

      <section className="admin-panel">
        <h2>Create Doctor Account</h2>
        <form className="doctor-form" onSubmit={handleCreateDoctor}>
          <input
            type="text"
            placeholder="Doctor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Doctor email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Temporary password (minimum 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <button type="submit">Create Doctor</button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>Patients</h2>
        {loading ? (
          <p>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <h2>Doctors</h2>
        {loading ? (
          <p>Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p>No doctors found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

