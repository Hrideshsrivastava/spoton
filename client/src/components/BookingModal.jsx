import React, { useState } from 'react';
import api from '../api';

export default function BookingModal({ open, onClose, day, time, room, onBooked }) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  if (!open) return null;

  const doBook = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/book', { day, room, time });
      setToken(res.data.token);
      setLoading(false);
      onBooked && onBooked();
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  const doUnbook = async () => {
    if (!token) return alert('No token available to unbook. Keep the booking token to unbook.');
    setLoading(true);
    try {
      await api.post('/api/unbook', { day, room, time, token });
      setToken(null);
      setLoading(false);
      onBooked && onBooked();
      onClose();
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.error || 'Unbooking failed');
    }
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="card" style={{width:420}}>
        <h3>Booking — {room}</h3>
        <div className="small">Day: {day} • Time: {time}</div>

        <div style={{marginTop:12}}>
          {token ? (
            <div>
              <div className="small">Your booking token (save this to unbook):</div>
              <div className="tokenBox" style={{marginTop:8}}>{token}</div>
              <div className="small" style={{marginTop:8}}>Booking expires automatically after 1 hour.</div>
              <div style={{marginTop:12, display:'flex', gap:8, justifyContent:'flex-end'}}>
                <button className="btn btn-muted" onClick={() => { setToken(null); onClose(); }}>Close</button>
                <button className="btn btn-primary" onClick={doUnbook} disabled={loading}>{loading ? 'Unbooking...' : 'Unbook'}</button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
              <button className="btn btn-muted" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={doBook} disabled={loading}>{loading ? 'Booking...' : 'Confirm Book'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
