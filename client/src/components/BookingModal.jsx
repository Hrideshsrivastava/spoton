import React, { useState } from "react";
import api from "../api";

export default function BookingModal({ open, onClose, day, time, room, onBooked, user }) {
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);

  if (!open) return null;

  async function doBook() {
    setLoading(true);
    try {
      const res = await api.post("/api/book", { day, room, time, user });
      const data = {
        token: res.data.token,
        timestamp: new Date().toLocaleString(),
        validTill: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString(),
      };
      setTokenData(data);
      onBooked && onBooked();
    } catch (err) {
      alert(err.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-[#0b1221] border-2 border-neon rounded-2xl p-6 w-full max-w-sm text-center shadow-[0_0_25px_rgba(34,211,238,0.6)]">
        <h3 className="text-neon text-2xl font-bold mb-3 tracking-wide">
          {tokenData ? "Room Pass" : `Book Room ${room}`}
        </h3>
        <p className="text-slate-300 mb-6 text-sm uppercase tracking-wider">
          {day} — {time}
        </p>

        {tokenData ? (
          <div className="bg-slate-900/70 border border-neon/50 rounded-xl p-5 text-left shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <h4 className="text-lg font-bold text-neon mb-2">Official Room Booking</h4>
            <div className="space-y-2 text-slate-200 text-sm font-mono">
              <p><span className="font-bold text-slate-400">Room:</span> {room}</p>
              <p><span className="font-bold text-slate-400">Day:</span> {day}</p>
              <p><span className="font-bold text-slate-400">Time:</span> {time}</p>
              <p><span className="font-bold text-slate-400">Token:</span> {tokenData.token}</p>
              <p><span className="font-bold text-slate-400">Issued:</span> {tokenData.timestamp}</p>
              <p><span className="font-bold text-slate-400">Valid till:</span> {tokenData.validTill}</p>
            </div>

            <div className="mt-5 border-t border-slate-700 pt-2 text-center text-[0.7rem] text-slate-400 italic">
              Present this pass to faculty for verification.<br />
              Valid for 1 hour from booking.
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 text-slate-100 rounded-lg font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={doBook}
              disabled={loading}
              className="flex-1 py-2 bg-neon text-darkbg font-bold rounded-lg shadow hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Booking..." : "Confirm"}
            </button>
          </div>
        )}

        {tokenData && (
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-slate-800 text-slate-100 py-2 rounded-lg font-semibold hover:bg-slate-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
