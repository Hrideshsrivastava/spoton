import React from "react";

export default function RoomCard({ room, onBook, isBooked }) {
  return (
    <div className="bg-[#0b1221] border border-neon/40 rounded-xl p-4 flex justify-between items-center hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-200 active:scale-95">
      <div>
        <p className="font-bold text-lg text-slate-100">{room}</p>
        <p className="text-xs text-slate-400 mt-1">
          {isBooked ? "Currently booked" : "Available"}
        </p>
      </div>
      <button
        onClick={() => onBook(room)}
        disabled={isBooked}
        className={`px-4 py-2 rounded-lg font-bold uppercase text-xs sm:text-sm transition ${
          isBooked
            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-neon text-darkbg hover:scale-105 hover:shadow-neon"
        }`}
      >
        {isBooked ? "Booked" : "Book"}
      </button>
    </div>
  );
}
