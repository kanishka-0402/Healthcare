"use client";

import { useState, useEffect } from "react";

export default function PatientDashboard() {
  const [name, setName] = useState<string>("");
  const [reports, setReports] = useState<any[]>([]);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());

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
      }
    };

    getPatient();
    getReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
              +
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                MediCare
              </h1>
              <p className="text-sm text-slate-500">
                Patient Portal
              </p>
            </div>
          </div>

          <span className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            ● Active
          </span>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-7 text-white shadow-xl shadow-blue-100 sm:p-10">
          <div className="relative z-10">
            <p className="mb-3 text-sm font-medium text-blue-100">
              YOUR HEALTH, OUR PRIORITY
            </p>

            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
              Welcome, {name || "Patient"}!
            </h2>

            <p className="max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
              Your personal health space. View your medical reports
              and keep track of your health information in one place.
            </p>
          </div>

          <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-28 h-48 w-48 rounded-full bg-white/10" />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
              📋
            </div>

            <p className="text-sm font-medium text-slate-500">
              Total Medical Reports
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800">
              {reports.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
              🩺
            </div>

            <p className="text-sm font-medium text-slate-500">
              Patient Status
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              Active
            </p>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                My Medical Reports
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your available medical test records
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {reports.length} Reports
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mb-4 text-5xl">📄</div>

              <h3 className="text-lg font-semibold text-slate-800">
                No Reports Available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your medical reports will appear here when available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <article
                  key={report._id}
                  className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      🧪
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Available
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-slate-800">
                    {report.testName}
                  </h3>

                  <div className="mb-4 rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Test Result
                    </p>

                    <p className="break-words text-sm leading-6 text-slate-700">
                      {report.result}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <span>📅</span>

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

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          © {year ?? ""} MediCare Patient Portal

          <p className="mt-1">
            Your health information, all in one place.
          </p>
        </footer>
      </div>
    </main>
  );
}
