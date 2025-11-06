import React from 'react';
import RoomCard from './RoomCard';

export default function RoomList({ rooms, onBook, bookedTokens }) {
  // bookedTokens: array of room names currently booked (for slot) -> to disable book button
  if (!rooms) return null;
  if (rooms.length === 0) return <div className="small">No available rooms for this slot.</div>;
  return (
    <div className="grid">
      {rooms.map(r => <RoomCard key={r} name={r} onBook={onBook} isBooked={bookedTokens?.includes(r)} />)}
    </div>
  );
}
