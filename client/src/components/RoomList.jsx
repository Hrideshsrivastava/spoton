import React, { useState, useEffect } from "react";
import api from "../api";
import FilterBar from "./FilterBar";
import RoomCard from "./RoomCard";
import BookingModal from "./BookingModal";

export default function RoomList({ user }) {
  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState({ day: "", time: "" });
  const [modal, setModal] = useState({ open: false, room: "" });
  const [loading, setLoading] = useState(false);

  // 🕐 Detect current day & time slot
  function getCurrentDay() {
    const daysOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    return daysOfWeek[new Date().getDay()];
  }

  function getCurrentTimeSlot() {
    const now = new Date();
    const hour = now.getHours();

    const slots = [
      "8-9", "9-10", "10-11", "11-12",
      "12-1", "1-2", "2-3", "3-4", "4-5", "5-6"
    ];

    if (hour < 8) return "8-9";
    if (hour >= 18) return "5-6";

    for (let i = 0; i < slots.length; i++) {
      const [start, end] = slots[i].split("-").map(Number);
      if (hour >= start && hour < end) return slots[i];
    }

    return "9-10";
  }

  // 🔹 Load available days/times
  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await api.get("/api/all");
        const { days, times } = res.data;
        setDays(days || []);
        setTimes(times || []);

        const currentDay = getCurrentDay();
        const currentTime = getCurrentTimeSlot(); // ✅ fixed function name

        const validDay = days?.includes(currentDay) ? currentDay : days?.[0] || "";
        const validTime = times?.includes(currentTime) ? currentTime : times?.[0] || "";
        setSelected({ day: validDay, time: validTime });
      } catch (err) {
        console.error("Metadata load failed:", err);
      }
    }
    loadMeta();
  }, []);

  // 🔹 Load empty rooms
  useEffect(() => {
    async function loadRooms() {
      if (!selected.day || !selected.time) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/rooms?day=${selected.day}&time=${selected.time}`);
        setRooms(res.data.rooms || []);
      } catch (err) {
        console.error("Room load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, [selected]);

  return (
    <div className="p-4 flex flex-col items-center text-slate-100">
      {/* Filter Bar */}
      <div className="w-full max-w-xl">
        <FilterBar
          days={days}
          times={times}
          selectedDay={selected.day}
          selectedTime={selected.time}
          onChange={setSelected}
        />
      </div>

      {/* Current Slot Info */}
      
      {/* Room grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 w-full max-w-2xl">
        {loading ? (
          <p className="col-span-full text-center text-slate-400 animate-pulse">
            Loading rooms...
          </p>
        ) : rooms?.length > 0 ? (
          rooms.map((room) => (
            <RoomCard
              key={room}
              room={room}
              onBook={() => setModal({ open: true, room })}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-slate-400 mt-8">
            No empty rooms available for this slot.
          </p>
        )}
      </div>

      {/* Booking modal */}
      <BookingModal
        open={modal.open}
        onClose={() => setModal({ open: false, room: "" })}
        day={selected.day}
        time={selected.time}
        room={modal.room}
        user={user}
        onBooked={() => setModal({ open: false, room: "" })}
      />
    </div>
  );
}
