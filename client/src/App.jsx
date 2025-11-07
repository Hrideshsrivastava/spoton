// import React, { useEffect, useState } from "react";
// import api from "./api";
// import FilterBar from "./components/FilterBar";
// import RoomList from "./components/RoomList";
// import BookingModal from "./components/BookingModal";
// import { io } from "socket.io-client";

// export default function App() {
//   const [days, setDays] = useState([]);
//   const [times, setTimes] = useState([]);
//   const [day, setDay] = useState("");
//   const [time, setTime] = useState("");
//   const [rooms, setRooms] = useState([]);
//   const [bookedRooms, setBookedRooms] = useState([]);
//   const [modal, setModal] = useState({ open: false, room: null });

//   useEffect(() => {
//     (async () => {
//       const res = await api.get("/api/all");
//       setDays(res.data.days);
//       setTimes(res.data.times);

//       // Auto-select current day and nearest time
//       const now = new Date();
//       const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
//       setDay(daysOfWeek[now.getDay()]);
//       const hour = now.getHours();
//       setTime(`${hour}-${hour + 1}`);
//     })();

//     const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
//     socket.on("booking_update", () => {
//       if (day && time) fetchRooms(day, time);
//     });
//     socket.on("reload", () => {
//       if (day && time) fetchRooms(day, time);
//     });
//     return () => socket.disconnect();
//   }, []);

//   async function fetchRooms(d, t) {
//     try {
//       const res = await api.get("/api/slot", { params: { day: d, time: t } });
//       setRooms(res.data.empties || []);
//       setBookedRooms(res.data.bookings?.map((b) => b.room) || []);
//     } catch {
//       setRooms([]);
//     }
//   }

//   useEffect(() => {
//     if (day && time) fetchRooms(day, time);
//   }, [day, time]);

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-6">
//       <header className="sticky top-0 z-10 bg-darkbg/90 backdrop-blur-md border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg shadow-neon">
//         <strong> <h1 class="text-xl sm:text-2xl text-center font-bold text-neon drop-shadow-glow">SpotON</h1></strong>
//         <p className="text-xs sm:text-sm text-slate-400">Realtime | Mobile-friendly</p>
//       </header>

//       <FilterBar
//         days={days}
//         times={times}
//         selectedDay={day}
//         selectedTime={time}
//         onChange={({ day: d, time: t }) => {
//           setDay(d);
//           setTime(t);
//         }}
//       />

//       <RoomList
//         rooms={rooms}
//         bookedRooms={bookedRooms}
//         onBook={(r) => setModal({ open: true, room: r })}
//       />

//       <BookingModal
//         open={modal.open}
//         onClose={() => setModal({ open: false, room: null })}
//         day={day}
//         time={time}
//         room={modal.room}
//         onBooked={() => fetchRooms(day, time)}
//       />

//       <footer className="text-center mt-10 text-xs text-slate-500">
//         © 2025 SpotOn | Built with TailwindCSS
//       </footer>
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import MyBookings from "./components/MyBookings";

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("enrollment") || null);
  const [page, setPage] = useState("rooms");

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="bg-darkbg min-h-screen text-slate-100">
      <nav className="p-4 flex justify-between bg-slate-900/60 border-b border-neon/40">
        <h1 className="text-neon font-bold text-lg">SpotON</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setPage("rooms")}
            className={`px-3 py-1 rounded-lg ${page === "rooms" ? "bg-neon text-darkbg" : "bg-slate-800"}`}
          >
            Rooms
          </button>
          <button
            onClick={() => setPage("bookings")}
            className={`px-3 py-1 rounded-lg ${page === "bookings" ? "bg-neon text-darkbg" : "bg-slate-800"}`}
          >
            My Bookings
          </button>
        </div>
      </nav>

      {page === "rooms" && <RoomList user={user} />}
      {page === "bookings" && <MyBookings user={user} />}
    </div>
  );
}