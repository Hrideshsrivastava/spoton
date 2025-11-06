import React from "react";

export default function FilterBar({ days, times, selectedDay, selectedTime, onChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
      {/* --- Day Select --- */}
      <div className="relative w-full sm:w-1/2">
        <select
          className="appearance-none w-full bg-[#0b1221] border border-neon/70 text-slate-100 rounded-lg px-4 py-3 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-neon shadow-[0_0_10px_rgba(34,211,238,0.3)] cursor-pointer"
          value={selectedDay}
          onChange={(e) => onChange({ day: e.target.value, time: selectedTime })}
        >
          <option className="bg-[#0b1221] text-slate-300" value="">
            Select Day
          </option>
          {days.map((d) => (
            <option
              key={d}
              value={d}
              className="bg-[#0b1221] text-slate-200 hover:bg-neon hover:text-darkbg"
            >
              {d}
            </option>
          ))}
        </select>

        {/* Dropdown arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neon">
          ▼
        </div>
      </div>

      {/* --- Time Select --- */}
      <div className="relative w-full sm:w-1/2">
        <select
          className="appearance-none w-full bg-[#0b1221] border border-neon/70 text-slate-100 rounded-lg px-4 py-3 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-neon shadow-[0_0_10px_rgba(34,211,238,0.3)] cursor-pointer"
          value={selectedTime}
          onChange={(e) => onChange({ day: selectedDay, time: e.target.value })}
        >
          <option className="bg-[#0b1221] text-slate-300" value="">
            Select Time
          </option>
          {times.map((t) => (
            <option
              key={t}
              value={t}
              className="bg-[#0b1221] text-slate-200 hover:bg-neon hover:text-darkbg"
            >
              {t}
            </option>
          ))}
        </select>

        {/* Dropdown arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neon">
          ▼
        </div>
      </div>
    </div>
  );
}
