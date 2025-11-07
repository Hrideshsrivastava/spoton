import React, { useState, useEffect } from "react";
import api from "../api";

export default function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    async function loadBookings() {
      const res = await api.get(`/api/user-bookings?user=${user}`);
      setBookings(res.data.bookings || []);
    }
    loadBookings();
  }, [user]);

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-neon mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-slate-400">No active bookings.</p>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-md">
          {bookings.map((b) => (
            <div key={b.token} className="bg-slate-800/60 border border-neon/40 rounded-xl p-4 text-center">
              <h3 className="text-neon text-lg font-bold mb-2">{b.room}</h3>
              <p>{b.day} — {b.time}</p>
              <p className="text-slate-400 text-sm mt-2">Token: {b.token}</p>
              <p className="text-slate-500 text-xs">Valid until {new Date(b.expiresAt).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
