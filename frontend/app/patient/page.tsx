"use client";

import { useState, useEffect } from "react";

type MedicalReport = {
  _id: string;
  testName: string;
  result: string;
  reportDate?: string;
};

export default function PatientDashboard() {
  const [name, setName] = useState("");
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setYear(new Date().getFullYear());

    const loadDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const [profileResponse, reportsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/auth/patient", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/reports/my-reports", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileResponse.json();

        if (
          !profileResponse.ok ||
          profileData.user?.role !== "patient"
        ) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        setName(profileData.user.name || "Patient");

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setReports(reportsData.reports || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleBookAppointment = () => {
    window.location.href = "/patient/appointments";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <main className="patient-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <div className="brand-symbol">+</div>
            <div>
              <h1>MediCare</h1>
              <p>Patient Portal</p>
            </div>
          </div>

          <div className="dashboard-header-actions">
            <span className="patient-badge">
              <span className="status-dot" />
              Patient Account
            </span>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <span>↪</span> Logout
            </button>
          </div>
        </header>

        <section className="patient-welcome">
          <div className="patient-welcome-content">
            <span className="welcome-label">
              YOUR HEALTH, OUR PRIORITY
            </span>

            <h2>
              Welcome back,
              <br />
              <span>{name || "Patient"}!</span>
            </h2>

            <p>
              Your personal health space. Access your medical reports,
              keep track of your records, and take the next step toward
              better health.
            </p>

            <button
              type="button"
              className="book-appointment-button"
              onClick={handleBookAppointment}
            >
              <span>＋</span> Book an Appointment <span>→</span>
            </button>
          </div>

          <div className="welcome-decoration" aria-hidden="true">
            <div className="welcome-circle">
              <span>✚</span>
            </div>
            <div className="welcome-orbit orbit-one" />
            <div className="welcome-orbit orbit-two" />
            <span className="decoration-cross cross-one">✚</span>
            <span className="decoration-cross cross-two">✦</span>
          </div>
        </section>

        <section className="patient-stats">
          <article className="patient-stat-card">
            <div className="stat-icon reports-stat-icon">▤</div>
            <div>
              <p>Total Medical Reports</p>
              <h3>{loading ? "—" : reports.length}</h3>
              <span className="stat-caption">
                Your available medical records
              </span>
            </div>
          </article>

          <article className="patient-stat-card">
            <div className="stat-icon status-stat-icon">♡</div>
            <div>
              <p>Account Status</p>
              <h3 className="active-status">Active</h3>
              <span className="stat-caption">
                Your patient portal is ready
              </span>
            </div>
          </article>

          <article className="patient-stat-card">
            <div className="stat-icon appointment-stat-icon">＋</div>
            <div>
              <p>Need a Consultation?</p>
              <h3 className="consultation-title">We're here to help</h3>
              <button
                type="button"
                className="small-book-link"
                onClick={handleBookAppointment}
              >
                Find a doctor →
              </button>
            </div>
          </article>
        </section>

        <section className="patient-reports-section">
          <div className="reports-heading">
            <div>
              <span className="section-eyebrow">YOUR HEALTH RECORDS</span>
              <h2>My Medical Reports</h2>
              <p>View your available medical test records in one place.</p>
            </div>

            <span className="reports-count">
              {loading ? "Loading..." : `${reports.length} Reports`}
            </span>
          </div>

          {loading ? (
            <div className="empty-reports">
              <div className="loading-spinner" />
              <h3>Loading your records...</h3>
              <p>Please wait while we fetch your medical reports.</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-reports">
              <div className="empty-reports-icon">▤</div>
              <h3>No Reports Available Yet</h3>
              <p>
                Your medical reports will appear here when they become
                available.
              </p>
              <button
                type="button"
                className="empty-book-button"
                onClick={handleBookAppointment}
              >
                Book an Appointment →
              </button>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <article className="medical-report-card" key={report._id}>
                  <div className="report-card-top">
                    <div className="report-test-icon">🧪</div>
                    <span className="report-status">
                      <span className="status-dot" />
                      Available
                    </span>
                  </div>

                  <h3>{report.testName}</h3>

                  <div className="report-result">
                    <span className="report-result-label">TEST RESULT</span>
                    <p>{report.result}</p>
                  </div>

                  <div className="report-date">
                    <span>▦</span>
                    <span>
                      {report.reportDate
                        ? new Date(report.reportDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "Date unavailable"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="dashboard-footer">
          <div className="footer-brand">
            <span>✚</span> MediCare
          </div>
          <p>
            © {year ?? ""} MediCare Patient Portal. Your health matters.
          </p>
          <span className="footer-security">🔒 Secure Patient Portal</span>
        </footer>
      </div>
    </main>
  );
}