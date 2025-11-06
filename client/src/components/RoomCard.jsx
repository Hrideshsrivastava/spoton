import React from 'react';

export default function RoomCard({ name, onBook, isBooked }) {
  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <strong>{name}</strong>
        <button className="btn btn-primary" onClick={() => onBook(name)} disabled={isBooked}>
          {isBooked ? 'Booked' : 'Book'}
        </button>
      </div>
      <div className="small" style={{marginTop:8}}>
        {isBooked ? 'This room is reserved now.' : 'Available for 1 hour booking.'}
      </div>
    </div>
  );
}
