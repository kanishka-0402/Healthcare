"use client";

import { useEffect, useState } from "react";

type MenuItem =
  | "Overview"
  | "My Appointments"
  | "My Patients"
  | "Add Medical Report"
  | "My Reports"
  | "My Profile";

type Patient = {
  _id: string;
  name: string;
  email: string;
};

type DoctorAppointment = {
  _id: string;
  patient: Patient | null;
  appointmentDate: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  reason?: string;
};

type DoctorProfile = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type MedicalReport = {
  _id: string;
  patient?: Patient | null;
  testName: string;
  result: string;
  reportDate: string;
};

export default function DoctorPage() {
  const [activeMenu, setActiveMenu] =
    useState<MenuItem>("Overview");

  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [result, setResult] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] =
    useState<DoctorAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] =
    useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  // Fetch appointments for the logged-in doctor.
  // This also provides the source data for My Patients.
  useEffect(() => {
    if (
      activeMenu !== "My Appointments" &&
      activeMenu !== "My Patients"
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setAppointmentsError("Please log in first.");
      return;
    }

    let cancelled = false;

    async function fetchAppointments() {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/appointments/doctor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch appointments."
          );
        }

        if (!cancelled) {
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        if (!cancelled) {
          setAppointmentsError(
            error instanceof Error
              ? error.message
              : "Cannot connect to the backend."
          );
        }
      } finally {
        if (!cancelled) {
          setAppointmentsLoading(false);
        }
      }
    }

    fetchAppointments();

    return () => {
      cancelled = true;
    };
  }, [activeMenu]);

  // Fetch the logged-in doctor's profile.
  useEffect(() => {
    if (activeMenu !== "My Profile") return;

    const token = localStorage.getItem("token");

    if (!token) {
      setProfileError("Please log in first.");
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      setProfileLoading(true);
      setProfileError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch profile."
          );
        }

        if (!cancelled) {
          setProfile(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Cannot connect to the backend."
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [activeMenu]);

  // Fetch reports.
  // This uses GET /api/reports, which must exist in the backend.
  useEffect(() => {
    if (activeMenu !== "My Reports") return;

    const token = localStorage.getItem("token");

    if (!token) {
      setReportsError("Please log in first.");
      return;
    }

    let cancelled = false;

    async function fetchReports() {
      setReportsLoading(true);
      setReportsError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/reports",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch reports."
          );
        }

        if (!cancelled) {
          setReports(data.reports || []);
        }
      } catch (error) {
        if (!cancelled) {
          setReportsError(
            error instanceof Error
              ? error.message
              : "Cannot connect to the backend."
          );
        }
      } finally {
        if (!cancelled) {
          setReportsLoading(false);
        }
      }
    }

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [activeMenu]);

  // Add a medical report.
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId,
            testName,
            result,
            reportDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to save report.");
        return;
      }

      setMessage("Report saved successfully!");
      setPatientId("");
      setTestName("");
      setResult("");
      setReportDate("");
    } catch {
      setMessage("Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  // Make a unique patient list from appointments.
  const uniquePatients = Array.from(
    new Map(
      appointments
        .filter(
          (
            appointment
          ): appointment is DoctorAppointment & {
            patient: Patient;
          } => Boolean(appointment.patient?._id)
        )
        .map((appointment) => [
          appointment.patient._id,
          appointment.patient,
        ])
    ).values()
  );

  const menuItems: { label: MenuItem; icon: string }[] = [
    { label: "Overview", icon: "⌂" },
    { label: "My Appointments", icon: "▦" },
    { label: "My Patients", icon: "♙" },
    { label: "Add Medical Report", icon: "✚" },
    { label: "My Reports", icon: "▤" },
    { label: "My Profile", icon: "◎" },
  ];

  return (
    <main className="doctor-dashboard">
      <aside className="doctor-sidebar">
        <div className="doctor-brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>CarePoint</h2>
            <p>Doctor Portal</p>
          </div>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="doctor-nav">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                activeMenu === item.label
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActiveMenu(item.label);
                setMessage("");
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeMenu === item.label && (
                <span className="active-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon">?</div>
          <h3>Need assistance?</h3>
          <p>
            Contact your system administrator for support.
          </p>
        </div>
      </aside>

      <section className="doctor-main">
        <header className="doctor-topbar">
          <div>
            <p className="breadcrumb">
              Doctor Portal / {activeMenu}
            </p>
            <h1>{activeMenu}</h1>
          </div>

          <div className="doctor-user">
            <div className="user-avatar">
              {profile?.name?.charAt(0).toUpperCase() || "D"}
            </div>
            <div>
              <strong>{profile?.name || "Doctor"}</strong>
              <p>Medical Professional</p>
            </div>
          </div>
        </header>

        {/* OVERVIEW */}
        {activeMenu === "Overview" && (
          <div className="dashboard-content">
            <div className="welcome-banner">
              <div>
                <p className="eyebrow">DOCTOR WORKSPACE</p>
                <h2>Welcome to your dashboard</h2>
                <p>
                  Manage appointments, patients and medical reports
                  from one place.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    setActiveMenu("Add Medical Report")
                  }
                >
                  <span>✚</span> Add Medical Report
                </button>
              </div>
              <div className="welcome-symbol">✚</div>
            </div>

            <div className="overview-grid">
              <article className="overview-card">
                <div className="overview-icon blue">▦</div>
                <p>My Appointments</p>
                <h3>{appointments.length}</h3>
                <span>Appointments currently loaded</span>
              </article>

              <article className="overview-card">
                <div className="overview-icon green">♙</div>
                <p>My Patients</p>
                <h3>{uniquePatients.length}</h3>
                <span>Unique patients currently loaded</span>
              </article>

              <article className="overview-card">
                <div className="overview-icon purple">▤</div>
                <p>Medical Reports</p>
                <h3>{reports.length}</h3>
                <span>Reports currently loaded</span>
              </article>
            </div>

            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Choose what you would like to do next.</p>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenu("My Appointments")
                  }
                >
                  <span className="action-icon blue">▦</span>
                  <span>
                    <strong>View Appointments</strong>
                    <small>Check your patient schedule</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMenu("My Patients")}
                >
                  <span className="action-icon green">♙</span>
                  <span>
                    <strong>View Patients</strong>
                    <small>Access your patient list</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMenu("Add Medical Report")
                  }
                >
                  <span className="action-icon purple">✚</span>
                  <span>
                    <strong>Add Medical Report</strong>
                    <small>Save a patient's medical report</small>
                  </span>
                  <span className="action-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MY APPOINTMENTS */}
        {activeMenu === "My Appointments" && (
          <div className="dashboard-content">
            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>Appointment Schedule</h2>
                  <p>
                    View patients who have booked appointments
                    with you.
                  </p>
                </div>
                <div className="report-heading-icon">▦</div>
              </div>

              {appointmentsLoading ? (
                <p>Loading appointments...</p>
              ) : appointmentsError ? (
                <p className="report-message" role="alert">
                  {appointmentsError}
                </p>
              ) : appointments.length === 0 ? (
                <p>No appointments found.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Patient
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Email
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Date
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Time
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment._id}>
                          <td style={{ padding: "12px" }}>
                            {appointment.patient?.name ||
                              "Patient unavailable"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {appointment.patient?.email || "—"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {appointment.timeSlot}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {appointment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY PATIENTS */}
        {activeMenu === "My Patients" && (
          <div className="dashboard-content">
            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>My Patients</h2>
                  <p>Patients who have booked appointments with you.</p>
                </div>
                <div className="report-heading-icon">♙</div>
              </div>

              {appointmentsLoading ? (
                <p>Loading patients...</p>
              ) : appointmentsError ? (
                <p className="report-message" role="alert">
                  {appointmentsError}
                </p>
              ) : uniquePatients.length === 0 ? (
                <p>No patients found. Patients will appear here after booking an appointment with you.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Patient Name
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Email
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Appointments
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniquePatients.map((patient) => {
                        const patientAppointments =
                          appointments.filter(
                            (appointment) =>
                              appointment.patient?._id === patient._id
                          );

                        return (
                          <tr key={patient._id}>
                            <td style={{ padding: "12px" }}>
                              {patient.name}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {patient.email}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {patientAppointments.length}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADD MEDICAL REPORT */}
        {activeMenu === "Add Medical Report" && (
          <div className="dashboard-content">
            <div className="content-panel report-panel">
              <div className="panel-heading">
                <div>
                  <h2>Add Medical Report</h2>
                  <p>
                    Enter the patient's medical report details below.
                  </p>
                </div>
                <div className="report-heading-icon">✚</div>
              </div>

              <form className="report-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="patientId">Patient ID</label>
                  <input
                    id="patientId"
                    type="text"
                    placeholder="Enter patient MongoDB ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="testName">Test Name</label>
                  <input
                    id="testName"
                    type="text"
                    placeholder="e.g. Blood Test"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="result">Report Result</label>
                  <textarea
                    id="result"
                    placeholder="Enter the report result"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="reportDate">Report Date</label>
                  <input
                    id="reportDate"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions full-width">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setPatientId("");
                      setTestName("");
                      setResult("");
                      setReportDate("");
                      setMessage("");
                    }}
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {loading ? "Saving Report..." : "Save Report"}
                  </button>
                </div>
              </form>

              {message && (
                <p className="report-message" role="status">
                  {message}
                </p>
              )}

              <p className="security-note">
                🔒 Patient medical information must be handled securely.
              </p>
            </div>
          </div>
        )}

        {/* MY REPORTS */}
        {activeMenu === "My Reports" && (
          <div className="dashboard-content">
            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>My Reports</h2>
                  <p>Medical reports available from the backend.</p>
                </div>
                <div className="report-heading-icon">▤</div>
              </div>

              {reportsLoading ? (
                <p>Loading reports...</p>
              ) : reportsError ? (
                <p className="report-message" role="alert">
                  {reportsError}
                </p>
              ) : reports.length === 0 ? (
                <p>No reports found.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Patient
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Test Name
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Result
                        </th>
                        <th style={{ textAlign: "left", padding: "12px" }}>
                          Report Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report._id}>
                          <td style={{ padding: "12px" }}>
                            {report.patient?.name || "Patient"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {report.testName}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {report.result}
                          </td>
                          <td style={{ padding: "12px" }}>
                            {report.reportDate
                              ? new Date(
                                  report.reportDate
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY PROFILE */}
        {activeMenu === "My Profile" && (
          <div className="dashboard-content">
            <div className="content-panel">
              <div className="panel-heading">
                <div>
                  <h2>My Profile</h2>
                  <p>Your account information</p>
                </div>
                <div className="report-heading-icon">◎</div>
              </div>

              {profileLoading ? (
                <p>Loading profile...</p>
              ) : profileError ? (
                <p className="report-message" role="alert">
                  {profileError}
                </p>
              ) : profile ? (
                <div className="profile-details">
                  <p>
                    <strong>Name:</strong> {profile.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile.role}
                  </p>
                  <p>
                    <strong>User ID:</strong> {profile._id}
                  </p>
                </div>
              ) : (
                <p>Profile information is unavailable.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
