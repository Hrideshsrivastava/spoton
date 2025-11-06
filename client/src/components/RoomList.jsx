import React from "react";
import RoomCard from "./RoomCard";

export default function RoomList({ rooms, bookedRooms, onBook }) {
  if (!rooms.length)
    return <p className="text-center text-slate-400 mt-10">No available rooms for this slot.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
      {rooms.map((r) => (
        <RoomCard
          key={r}
          name={r}
          onBook={onBook}
          isBooked={bookedRooms.includes(r)}
        />
      ))}
    </div>
  );
}
