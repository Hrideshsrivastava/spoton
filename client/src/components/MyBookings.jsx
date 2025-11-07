import React, { useEffect, useState } from "react";
import api from "../api";
import socket from "../socket";
export default function MyBookings({ user, active }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/user-bookings?user=${user}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Booking load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Fetch latest data when this tab becomes active
  useEffect(() => {
    if (active) {
      loadBookings();
    }
  }, [active]);

  // 🔹 Also auto-refresh when any booking updates (via Socket)
  useEffect(() => {
    function refreshOnBookingChange(data) {
      if (active && user) loadBookings();
    }

    socket.on("booking_update", refreshOnBookingChange);
    socket.on("booking_cleanup", refreshOnBookingChange);

    return () => {
      socket.off("booking_update", refreshOnBookingChange);
      socket.off("booking_cleanup", refreshOnBookingChange);
    };
  }, [active, user]);

  return (
    <div className="p-4 flex flex-col items-center text-slate-100">
      <h2 className="text-neon text-lg font-bold mb-4">My Bookings</h2>
      {loading ? (
        <p className="text-slate-400 animate-pulse">Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-400 mt-6">No active bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full max-w-md overflow-y-auto">
          {bookings.map((b) => (
            <div
              key={b.token}
              className="bg-darkbg border border-neon/30 rounded-xl p-4 shadow-md shadow-neon/10"
            >
              <p className="text-sm mb-2">
                <span className="text-slate-400">Room:</span>{" "}
                <span className="text-neon font-semibold">{b.room}</span>
              </p>
              <p className="text-sm mb-1">
                <span className="text-slate-400">Day:</span> {b.day}
              </p>
              <p className="text-sm mb-1">
                <span className="text-slate-400">Time:</span> {b.time}
              </p>
              <p className="text-sm mb-1">
                <span className="text-slate-400">Enrollment:</span> {b.user}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Token: {b.token.slice(0, 8)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
