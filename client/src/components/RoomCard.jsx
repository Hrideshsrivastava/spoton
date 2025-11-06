import React from "react";

export default function RoomCard({ name, onBook, isBooked }) {
  return (
    <div className="bg-darkbg/70 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:shadow-neon transition-all duration-200 active:scale-95">
      <div>
        <p className="font-bold text-lg">{name}</p>
        <p className="text-xs text-slate-400 mt-1">{isBooked ? "Currently booked" : "Available"}</p>
      </div>
      <button
        onClick={() => onBook(name)}
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
