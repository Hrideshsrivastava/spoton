import React from 'react';

export default function FilterBar({ days, times, selectedDay, selectedTime, onChange }) {
  return (
    <div className="controls">
      <select className="select" value={selectedDay} onChange={e => onChange({ day: e.target.value, time: selectedTime })}>
        <option value="">Select Day</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select className="select" value={selectedTime} onChange={e => onChange({ day: selectedDay, time: e.target.value })}>
        <option value="">Select Time</option>
        {times.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
