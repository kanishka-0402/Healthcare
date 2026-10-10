
"use client";

import { useState } from "react";

export default function DoctorPage() {
  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [result, setResult] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <main className="doctor-page">
      <div className="report-card">
        <div className="report-icon">✚</div>

        <h1>Add Medical Report</h1>
        <p className="subtitle">
          Enter the patient's medical report details below.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="patientId">Patient ID</label>
          <input
            id="patientId"
            type="text"
            placeholder="Enter patient MongoDB ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />

          <label htmlFor="testName">Test Name</label>
          <input
            id="testName"
            type="text"
            placeholder="e.g. Blood Test"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            required
          />

          <label htmlFor="result">Report Result</label>
          <textarea
            id="result"
            placeholder="Enter the report result"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            required
          />

          <label htmlFor="reportDate">Report Date</label>
          <input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving Report..." : "Save Report"}
          </button>
        </form>

        {message && (
          <p className="report-message" role="status">
            {message}
          </p>
        )}

        <p className="footer-note">
          Patient medical information should be handled securely.
        </p>
      </div>
    </main>
  );
}