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
  const [creating, setCreating] = useState(false);

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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load users.");
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
    setCreating(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in as admin.");
      setCreating(false);
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
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="simple-admin">
      <header className="simple-admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage patients and doctors.</p>
        </div>

        <button
          type="button"
          className="simple-button secondary-button"
          onClick={() => {
            setLoading(true);
            fetchUsers();
          }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {message && <p className="simple-message" role="status">{message}</p>}

      <section className="simple-stats">
        <article className="simple-card">
          <p>Total Patients</p>
          <h2>{loading ? "—" : patients.length}</h2>
        </article>

        <article className="simple-card">
          <p>Total Doctors</p>
          <h2>{loading ? "—" : doctors.length}</h2>
        </article>
      </section>

      <section className="simple-panel" id="create-doctor">
        <h2>Create Doctor Account</h2>

        <form className="simple-form" onSubmit={handleCreateDoctor}>
          <label>
            Doctor Name
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            className="simple-button"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Doctor"}
          </button>
        </form>
      </section>

      <UserTable
        title="Registered Patients"
        users={patients}
        loading={loading}
        emptyText="No patients found."
      />

      <UserTable
        title="Registered Doctors"
        users={doctors}
        loading={loading}
        emptyText="No doctors found."
      />
    </main>
  );
}

function UserTable({
  title,
  users,
  loading,
  emptyText,
}: {
  title: string;
  users: User[];
  loading: boolean;
  emptyText: string;
}) {
  return (
    <section className="simple-panel">
      <div className="simple-table-heading">
        <h2>{title}</h2>
        <span>{users.length} total</span>
      </div>

      {loading ? (
        <p className="simple-empty">Loading accounts...</p>
      ) : users.length === 0 ? (
        <p className="simple-empty">{emptyText}</p>
      ) : (
        <div className="simple-table-wrapper">
          <table className="simple-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
