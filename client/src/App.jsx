import React, { useState, useRef } from "react";
import Login from "./components/Login";
import RoomList from "./components/RoomList";
import MyBookings from "./components/MyBookings";

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("enrollment") || null);
  const [page, setPage] = useState("rooms");
  const startX = useRef(0);

  if (!user) return <Login onLogin={setUser} />;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX.current;

    if (diff < -60 && page === "rooms") setPage("bookings"); // swipe left
    if (diff > 60 && page === "bookings") setPage("rooms"); // swipe right
  };

  return (
    <div
      className="bg-darkbg min-h-screen text-slate-100 overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navbar */}
      <nav className="p-4 flex justify-between bg-slate-900/60 border-b border-neon/40 sticky top-0 z-50 backdrop-blur-md">
        <h1 className="text-neon font-bold text-lg">SpotON</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setPage("rooms")}
            className={`px-3 py-1 rounded-lg ${
              page === "rooms"
                ? "bg-neon text-darkbg shadow-neon"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setPage("bookings")}
            className={`px-3 py-1 rounded-lg ${
              page === "bookings"
                ? "bg-neon text-darkbg shadow-neon"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            My Bookings
          </button>
          <button
  onClick={() => {
    localStorage.removeItem("enrollment");
    window.location.reload();
  }}
  className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
>
  Logout
</button>

        </div>
      </nav>

      {/* Content Wrapper (fixes collapsing height) */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* RoomList */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
            page === "rooms"
              ? "translate-x-0 opacity-100 pointer-events-auto"
              : "-translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <RoomList user={user} />
        </div>

        {/* MyBookings */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
            page === "bookings"
              ? "translate-x-0 opacity-100 pointer-events-auto"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <MyBookings user={user} active={page === "bookings"} />

        </div>
      </div>
    </div>
  );
}
