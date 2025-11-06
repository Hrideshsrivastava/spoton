import React, { useEffect, useState } from 'react';
import api from './api';
import FilterBar from './components/FilterBar';
import RoomList from './components/RoomList';
import BookingModal from './components/BookingModal';
import { io } from 'socket.io-client';

export default function App() {
  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [rooms, setRooms] = useState([]);
  const [bookedRooms, setBookedRooms] = useState([]); // names currently booked in this slot
  const [modal, setModal] = useState({ open: false, room: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/all');
        setDays(res.data.days);
        setTimes(res.data.times);
      } catch (e) {
        console.warn('/api/all failed', e);
      }
    })();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    socket.on('booking_update', () => {
      if (day && time) fetchRooms(day, time);
    });
    socket.on('booking_cleanup', () => {
      if (day && time) fetchRooms(day, time);
    });
    socket.on('reload', () => {
      // reload filters & maybe reload page
      api.get('/api/all').then(r => { setDays(r.data.days); setTimes(r.data.times); }).catch(()=>{});
      if (day && time) fetchRooms(day, time);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (day && time) fetchRooms(day, time);
    else { setRooms([]); setBookedRooms([]); }
  }, [day, time]);

  async function fetchRooms(d, t) {
    try {
      const res = await api.get('/api/slot', { params: { day: d, time: t } });
      setRooms(res.data.empties || []);
      const slotBookings = res.data.bookings || [];
      setBookedRooms(slotBookings.map(b => b.room));
    } catch (err) {
      setRooms([]);
      setBookedRooms([]);
    }
  }

  function openBooking(roomName) {
    setModal({ open: true, room: roomName });
  }

  function onBooked() {
    if (day && time) fetchRooms(day, time);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Empty Classroom Finder</h1>
        <div className="small">CSV-backed • In-memory bookings persisted to disk • Real-time updates</div>
      </div>

      <FilterBar days={days} times={times} selectedDay={day} selectedTime={time} onChange={({ day: d, time: t }) => { setDay(d); setTime(t); }} />

      <div style={{marginTop:8}}>
        <RoomList rooms={rooms} onBook={openBooking} bookedTokens={bookedRooms} />
      </div>

      <BookingModal open={modal.open} onClose={() => setModal({ open: false, room: null })} day={day} time={time} room={modal.room} onBooked={onBooked} />

      <div className="footer">
        Tip: Admins can upload a new CSV via POST /api/upload to swap the timetable.
      </div>
    </div>
  );
}
