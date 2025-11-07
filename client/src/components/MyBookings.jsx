import React, { useEffect, useState } from "react";
import api from "../api";

export default function MyBookings({ user, active }) {
  const [bookings, setBookings] = useState([]);

  async function loadBookings() {
    try {
      const res = await api.get(`/api/user-bookings?user=${user}`);

      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Booking load failed:", err);
    }
  }

  // Load when mounted
  useEffect(() => {
    loadBookings();
  }, []);

  // 🔄 Also reload when tab becomes active
  useEffect(() => {
    if (active) loadBookings();
  }, [active]);

  if (!bookings.length)
    return <p className="text-slate-400 text-center mt-6">No bookings yet.</p>;

  return (
    <div className="p-4 grid gap-4 max-w-md mx-auto">
      {bookings.map((b) => (
        <div
          key={b.token}
          className="bg-darkbg border border-neon/40 rounded-xl p-4 shadow-md"
        >
          <p className="text-neon font-bold text-lg mb-1">Room {b.room}</p>
          <p className="text-slate-300 text-sm">{b.day} — {b.time}</p>
          <p className="text-slate-400 text-xs mt-2">
            Token: <span className="text-slate-200">{b.token}</span>
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Enrollment: {user}
          </p>
        </div>
      ))}
    </div>
  );
}
