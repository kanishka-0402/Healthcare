"use client";

import { useEffect, useState } from "react";

type Doctor = {
  _id: string;
  name: string;
  email: string;
};

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctor, setDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
 const [today] = useState(() => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
});
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [booking, setBooking] = useState(false);

 

  useEffect(() => {
    let cancelled = false;

    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (!cancelled) {
            setMessage("Please log in to view available doctors.");
          }
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/appointments/doctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load doctors.");
        }

        if (!cancelled) {
          setDoctors(data.doctors || []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to connect to the server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDoctors(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBooking = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in before booking an appointment.");
      return;
    }

    if (!doctor || !appointmentDate || !timeSlot) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (appointmentDate < today) {
      setMessage("Please select today or a future date.");
      return;
    }

    setBooking(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctor,
            appointmentDate,
            timeSlot,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to book the appointment."
        );
        return;
      }

      setMessage("Appointment booked successfully!");
      setDoctor("");
      setAppointmentDate("");
      setTimeSlot("");
      setReason("");
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setBooking(false);
    }
  };

  const selectedDoctor = doctors.find(
    (item) => item._id === doctor
  );

  return (
    <main className="book-appointment-page">
      <div className="book-appointment-container">
        <header className="book-appointment-heading">
          <p className="book-appointment-breadcrumb">
            Patient Portal <span>/</span> Appointments
          </p>
          <h1>Book an Appointment</h1>
          <p className="book-appointment-subtitle">
            Schedule a consultation with your preferred doctor.
          </p>
        </header>

        <section className="book-appointment-card">
          <div className="book-appointment-hero">
            <div className="book-appointment-hero-content">
              <span className="book-appointment-badge">
                <span className="book-appointment-badge-dot" />
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h2>Your health journey starts here.</h2>

              <p>
                Choose a doctor and a convenient time for your
                consultation.
              </p>
            </div>

            <div className="book-appointment-hero-decoration">
              <span>+</span>
            </div>
          </div>

          <form
            onSubmit={handleBooking}
            className="book-appointment-form"
          >
            <div className="book-appointment-section-heading">
              <div>
                <h3>Appointment Details</h3>
                <p>Fields marked with * are required</p>
              </div>
              <span className="book-appointment-section-icon">✚</span>
            </div>

            <div className="book-appointment-field">
              <label htmlFor="doctor">
                Select Doctor <span>*</span>
              </label>

              <select
                id="doctor"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                required
                disabled={loadingDoctors || doctors.length === 0}
              >
                <option value="">
                  {loadingDoctors
                    ? "Loading doctors..."
                    : "Choose a doctor"}
                </option>

                {doctors.map((item) => (
                  <option key={item._id} value={item._id}>
                    Dr. {item.name} — {item.email}
                  </option>
                ))}
              </select>

              {!loadingDoctors && doctors.length === 0 && (
                <p className="book-appointment-hint">
                  No doctors are currently available.
                </p>
              )}

              {selectedDoctor && (
                <div className="book-appointment-selected-doctor">
                  <div className="book-appointment-avatar">
                    {selectedDoctor.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="book-appointment-doctor-info">
                    <strong>Dr. {selectedDoctor.name}</strong>
                    <span>{selectedDoctor.email}</span>
                  </div>

                  <span className="book-appointment-selected-label">
                    Selected
                  </span>
                </div>
              )}
            </div>

            <div className="book-appointment-fields-grid">
              <div className="book-appointment-field">
                <label htmlFor="appointmentDate">
                  Appointment Date <span>*</span>
                </label>

                <input
                  id="appointmentDate"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={today || undefined}
                  required
                />
              </div>

              <div className="book-appointment-field">
                <label htmlFor="timeSlot">
                  Preferred Time <span>*</span>
                </label>

                <select
                  id="timeSlot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                >
                  <option value="">Choose a time</option>
                  <option value="10:00 AM - 10:30 AM">
                    10:00 AM – 10:30 AM
                  </option>
                  <option value="10:30 AM - 11:00 AM">
                    10:30 AM – 11:00 AM
                  </option>
                  <option value="11:00 AM - 11:30 AM">
                    11:00 AM – 11:30 AM
                  </option>
                  <option value="11:30 AM - 12:00 PM">
                    11:30 AM – 12:00 PM
                  </option>
                  <option value="2:00 PM - 2:30 PM">
                    2:00 PM – 2:30 PM
                  </option>
                  <option value="2:30 PM - 3:00 PM">
                    2:30 PM – 3:00 PM
                  </option>
                </select>
              </div>
            </div>

            <div className="book-appointment-field">
              <label htmlFor="reason">
                Reason for Appointment
                <span className="book-appointment-optional">
                  (Optional)
                </span>
              </label>

              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for the visit..."
                rows={4}
              />
            </div>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`book-appointment-message ${
                  message.toLowerCase().includes("success")
                    ? "book-appointment-message-success"
                    : "book-appointment-message-error"
                }`}
              >
                <span aria-hidden="true">
                  {message.toLowerCase().includes("success")
                    ? "✓"
                    : "ⓘ"}
                </span>
                {message}
              </div>
            )}

            <div className="book-appointment-footer">
              <p>
                <span>🔒</span> Your appointment details will be
                handled securely.
              </p>

              <button
                type="submit"
                disabled={
                  booking || loadingDoctors || doctors.length === 0
                }
              >
                {booking
                  ? "Booking Appointment..."
                  : "Confirm Appointment"}
                {!booking && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
        </section>

        <p className="book-appointment-bottom-note">
          CarePoint Healthcare · Your health matters to us.
        </p>
      </div>
    </main>
  );
}
