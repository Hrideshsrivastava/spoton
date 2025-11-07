import React, { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [enrollment, setEnrollment] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("enrollment");
    if (saved) onLogin(saved);
  }, []);

  function handleLogin() {
    if (!enrollment.trim()) return alert("Please enter your enrollment number");
    localStorage.setItem("enrollment", enrollment.trim());
    onLogin(enrollment.trim());
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-darkbg text-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-neon">SpotON — Login</h1>
      <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg w-80 text-center border border-neon/50">
        <input
          type="text"
          placeholder="Enter Enrollment Number"
          value={enrollment}
          onChange={(e) => setEnrollment(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-darkbg font-semibold text-center focus:ring-2 focus:ring-neon focus:outline-none"
        />
        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-neon text-darkbg py-2 rounded-lg font-bold hover:scale-105 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
