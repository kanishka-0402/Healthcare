
"use client";

import { useState, useEffect } from "react";

export default function PatientDashboard() {
  const [name, setName] = useState<string>("");
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const getPatient = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/patient",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Reports:", data);

      if (!response.ok) {
        window.location.href = "/login";
        return;
      }

      setName(data.user.name);
    };

    const getReports = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        "http://localhost:5000/api/reports/my-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setReports(data.reports);
      } else {
        console.log("Reports error:", data);
      }
    };

    getPatient();
    getReports();
  }, []);

  return (
    <main>
      <h1>Patient Dashboard</h1>
      <p>Welcome, {name}!</p>

      <h2>My Medical Reports</h2>

      {reports.length === 0 && <p>No reports available.</p>}

      {reports.map((report) => (
        <div key={report._id}>
          <h3>{report.testName}</h3>
          <p>Result: {report.result}</p>
          <p>Date: {report.reportDate}</p>
        </div>
      ))}
    </main>
  );
}