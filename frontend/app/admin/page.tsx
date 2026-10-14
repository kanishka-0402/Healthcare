"use client";
import Chatbot from "@/component/chatbox/Chatbot";
import { useCallback, useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};
type Appointment = {
  _id: string;
  patient: User | null;
  doctor: User | null;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

export default function AdminPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
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
      const appointmentResponse = await fetch(
  "http://localhost:5000/api/appointments/admin/all",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const appointmentData = await appointmentResponse.json();

if (!appointmentResponse.ok) {
  setMessage(appointmentData.message || "Unable to load appointments.");
  return;
}

setAppointments(appointmentData.appointments || []);
      setMessage("");
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
    }, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    fetchUsers();
  }, 0);

  return () => clearTimeout(timer);
}, [fetchUsers]);

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
    <main className="admin-modern-page">
      <div className="admin-modern-container">
        <header className="admin-modern-header">
          <div className="admin-modern-heading">
            <div className="admin-modern-eyebrow">
              <span className="admin-modern-live-dot" />
              CAREPOINT ADMINISTRATION
            </div>

            <h1>Admin Dashboard</h1>

            <p>
              Manage your healthcare network, monitor accounts and
              onboard medical professionals.
            </p>
          </div>

          <button
            type="button"
            className="admin-modern-refresh"
            onClick={() => {
              setLoading(true);
              fetchUsers();
            }}
            disabled={loading}
          >
            <span className="admin-modern-refresh-icon">↻</span>
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </header>

        <section className="admin-modern-welcome">
          <div className="admin-modern-welcome-content">
            <span className="admin-modern-welcome-label">
              ADMIN WORKSPACE
            </span>

            <h2>Everything under control.</h2>

            <p>
              Keep track of registered patients and doctors from one
              central workspace.
            </p>

            <a href="#admin-create-doctor">
              + Create Doctor Account
            </a>
          </div>

          <div className="admin-modern-welcome-art" aria-hidden="true">
            <div className="admin-modern-art-ring">
              <span>✚</span>
            </div>
            <div className="admin-modern-art-dot admin-modern-art-dot-one" />
            <div className="admin-modern-art-dot admin-modern-art-dot-two" />
          </div>
        </section>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`admin-modern-message ${
              message.toLowerCase().includes("success")
                ? "admin-modern-message-success"
                : "admin-modern-message-error"
            }`}
          >
            <span aria-hidden="true">
              {message.toLowerCase().includes("success") ? "✓" : "ⓘ"}
            </span>
            {message}
          </div>
        )}

        <section className="admin-modern-stats">
          <article className="admin-modern-stat-card">
            <div className="admin-modern-stat-top">
              <div className="admin-modern-stat-icon admin-modern-patient-icon">
                ♙
              </div>
              <span className="admin-modern-stat-tag">PATIENTS</span>
            </div>

            <p>Total Patients</p>

            <div className="admin-modern-stat-bottom">
              <h2>{loading ? "—" : patients.length}</h2>
              <span className="admin-modern-stat-description">
                Registered accounts
              </span>
            </div>
          </article>

          <article className="admin-modern-stat-card">
            <div className="admin-modern-stat-top">
              <div className="admin-modern-stat-icon admin-modern-doctor-icon">
                ✚
              </div>
              <span className="admin-modern-stat-tag">MEDICAL TEAM</span>
            </div>

            <p>Total Doctors</p>

            <div className="admin-modern-stat-bottom">
              <h2>{loading ? "—" : doctors.length}</h2>
              <span className="admin-modern-stat-description">
                Medical professionals
              </span>
            </div>
          </article>

          <article className="admin-modern-stat-card admin-modern-stat-highlight">
            <div className="admin-modern-stat-top">
              <div className="admin-modern-stat-icon admin-modern-network-icon">
                ◈
              </div>
              <span className="admin-modern-stat-tag">NETWORK</span>
            </div>

            <p>Total Accounts</p>

            <div className="admin-modern-stat-bottom">
              <h2>
                {loading ? "—" : patients.length + doctors.length}
              </h2>
              <span className="admin-modern-stat-description">
                Patients and doctors
              </span>
            </div>
          </article>
          <article className="admin-modern-stat-card">
  <div className="admin-modern-stat-top">
    <div className="admin-modern-stat-icon admin-modern-network-icon">
      ▣
    </div>
    <span className="admin-modern-stat-tag">APPOINTMENTS</span>
  </div>

  <p>Total Appointments</p>

  <div className="admin-modern-stat-bottom">
    <h2>{loading ? "—" : appointments.length}</h2>
    <span className="admin-modern-stat-description">
      All booked appointments
    </span>
  </div>
</article>
        </section>

        <section
          className="admin-modern-panel admin-modern-create-panel"
          id="admin-create-doctor"
        >
          <div className="admin-modern-panel-heading">
            <div className="admin-modern-panel-title">
              <div className="admin-modern-panel-icon">✚</div>
              <div>
                <h2>Create Doctor Account</h2>
                <p>
                  Add a medical professional to your healthcare network.
                </p>
              </div>
            </div>

            <span className="admin-modern-secure-badge">
              <span>✓</span> Secure
            </span>
          </div>

          <form
            className="admin-modern-form"
            onSubmit={handleCreateDoctor}
          >
            <div className="admin-modern-form-grid">
              <label className="admin-modern-field">
                <span>Doctor Name <b>*</b></span>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="admin-modern-field">
                <span>Email Address <b>*</b></span>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="admin-modern-field admin-modern-password-field">
                <span>Password <b>*</b></span>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <small>Use a strong password for the new account.</small>
              </label>
            </div>

            <div className="admin-modern-form-footer">
              <p>
                <span>🔒</span> Account information is transmitted securely.
              </p>

              <button type="submit" disabled={creating}>
                {creating ? "Creating Account..." : "Create Doctor"}
                {!creating && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
        </section>

        <UserTable
          title="Registered Patients"
          subtitle="View all patient accounts registered on CarePoint."
          users={patients}
          loading={loading}
          emptyText="No patients have registered yet."
          icon="♙"
          type="patients"
        />

        <UserTable
          title="Registered Doctors"
          subtitle="Manage visibility of the current medical team."
          users={doctors}
          loading={loading}
          emptyText="No doctor accounts found."
          icon="✚"
          type="doctors"
        />
       
<section className="admin-modern-panel admin-modern-table-panel">
  <div className="admin-modern-panel-heading">
    <div className="admin-modern-panel-title">
      <div className="admin-modern-panel-icon">▣</div>
      <div>
        <h2>All Appointments</h2>
        <p>View appointments booked by patients with their assigned doctors.</p>
      </div>
    </div>

    <span className="admin-modern-count-badge">
      {appointments.length} total
    </span>
  </div>

  {loading ? (
    <div className="admin-modern-empty">
      <p>Loading appointments...</p>
    </div>
  ) : appointments.length === 0 ? (
    <div className="admin-modern-empty">
      <h3>No appointments yet</h3>
      <p>Booked appointments will appear here.</p>
    </div>
  ) : (
    <div className="admin-modern-table-wrapper">
      <table className="admin-modern-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time Slot</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment.patient?.name || "N/A"}</td>
              <td>{appointment.doctor?.name || "N/A"}</td>
              <td>
                {new Date(appointment.appointmentDate).toLocaleDateString("en-IN")}
              </td>
              <td>{appointment.timeSlot}</td>
              <td>{appointment.reason || "Not specified"}</td>
              <td>{appointment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>


        <footer className="admin-modern-footer">
          <span>✚</span>
          CarePoint Healthcare Administration
        </footer>
                <Chatbot />
      </div>
    </main>
  );
}

function UserTable({
  title,
  subtitle,
  users,
  loading,
  emptyText,
  icon,
  type,
}: {
  title: string;
  subtitle: string;
  users: User[];
  loading: boolean;
  emptyText: string;
  icon: string;
  type: "patients" | "doctors";
}) {
  return (
    <section className="admin-modern-panel admin-modern-table-panel">
      <div className="admin-modern-panel-heading">
        <div className="admin-modern-panel-title">
          <div
            className={`admin-modern-panel-icon ${
              type === "patients"
                ? "admin-modern-patient-panel-icon"
                : "admin-modern-doctor-panel-icon"
            }`}
          >
            {icon}
          </div>

          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        <span className="admin-modern-count-badge">
          {users.length} total
        </span>
      </div>

      {loading ? (
        <div className="admin-modern-empty">
          <span className="admin-modern-loading-icon">↻</span>
          <p>Loading accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-modern-empty">
          <span className="admin-modern-empty-icon">{icon}</span>
          <h3>No accounts yet</h3>
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="admin-modern-table-wrapper">
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="admin-modern-user-cell">
                      <div
                        className={`admin-modern-user-avatar ${
                          type === "patients"
                            ? "admin-modern-user-avatar-patient"
                            : "admin-modern-user-avatar-doctor"
                        }`}
                      >
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>

                  <td className="admin-modern-email-cell">
                    {user.email}
                  </td>

                  <td>
                    <span
                      className={`admin-modern-role ${
                        type === "patients"
                          ? "admin-modern-role-patient"
                          : "admin-modern-role-doctor"
                      }`}
                    >
                      <span />
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
