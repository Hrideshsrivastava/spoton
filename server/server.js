

const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_ORIGINS = [
  "https://spoton-psi.vercel.app", // your frontend prod origin
  "http://localhost:3000",         // dev (vite)
];


const app = express();
app.use(cors({
  origin: function(origin, cb){
    // allow requests with no origin (like curl, server-side)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return cb(null, true);
    cb(new Error("CORS not allowed"));
  },
  methods: ["GET","POST","OPTIONS"],
  credentials: true,
}));
app.use(express.json());
app.use(fileUpload());

// Basic config
const PORT = process.env.PORT || 5000;
const PROJECT_ROOT = __dirname;
const CSV_PATH = path.join(PROJECT_ROOT, 'rooms.csv'); // canonical CSV
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
const BOOKINGS_PATH = path.join(PROJECT_ROOT, 'bookings.json');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const emptyMap = {};
// bookings[DAY][ROOM] = [ { time, token, user, bookedAt, expiresAt } ]

let bookings = {}; // persisted to file

// Booking defaults
const BOOKING_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Simple in-process lock for write operations
let _lock = false;
async function withLock(fn) {
  while (_lock) await new Promise(r => setTimeout(r, 10));
  _lock = true;
  try { return await fn(); } finally { _lock = false; }
}

// Utilities
function normalizeDay(s){ return String(s || '').trim().toUpperCase(); }
function normalizeRoom(s){ return String(s || '').trim(); }
function normalizeTime(s){ return String(s || '').trim(); }
function nowMs(){ return Date.now(); }

// Persist bookings to JSON
function saveBookingsToDisk() {
  try {
    fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save bookings:', e);
  }
}
function loadBookingsFromDisk() {
  if (!fs.existsSync(BOOKINGS_PATH)) {
    bookings = {};
    return;
  }
  try {
    bookings = JSON.parse(fs.readFileSync(BOOKINGS_PATH, 'utf8') || '{}');
  } catch (e) {
    console.error('Failed to read bookings.json, starting empty', e);
    bookings = {};
  }
}

// CSV loader (robust header handling)
function loadCSV(filePath = CSV_PATH) {
  return new Promise((resolve, reject) => {
    const map = {};
    if (!fs.existsSync(filePath)) {
      console.warn('CSV not found at', filePath);
      // keep empty map
      resolve(map);
      return;
    }
    fs.createReadStream(filePath)
  .pipe(csv({ headers: ["day", "classroom", "time"], skipLines: 0 }))
  .on("data", (row) => {
    const day = normalizeDay(row.day);
    const room = normalizeRoom(row.classroom);
    const time = normalizeTime(row.time);
    if (!day || !room || !time) return;

    if (!map[day]) map[day] = {};
    if (!map[day][room]) map[day][room] = new Set();
    map[day][room].add(time);
  })
  .on("end", () => {
    Object.keys(emptyMap).forEach(k => delete emptyMap[k]);
    Object.assign(emptyMap, map);
    console.log("CSV loaded successfully. Days:", Object.keys(emptyMap).length);
    resolve(map);
  })
  .on("error", (err) => {
    console.error("CSV parse error", err);
    reject(err);
  });

  });
}

// Cleanup expired bookings and emit events
function cleanupExpiredBookings() {
  const now = nowMs();
  let removed = 0;
  for (const day of Object.keys(bookings)) {
    for (const room of Object.keys(bookings[day])) {
      const arr = bookings[day][room];
      const keep = arr.filter(b => b.expiresAt > now);
      removed += (arr.length - keep.length);
      if (keep.length) bookings[day][room] = keep;
      else delete bookings[day][room];
    }
    if (Object.keys(bookings[day]).length === 0) delete bookings[day];
  }
  if (removed > 0) {
    saveBookingsToDisk();
    io.emit('booking_cleanup', { removed, now });
    console.log(`Cleaned up ${removed} expired bookings`);
  }
}

// get list of available rooms for slot (room is empty in CSV and not booked for that time)
function getAvailableRooms(day, time) {
  const D = normalizeDay(day);
  const T = normalizeTime(time);
  const out = [];
  const dayMap = emptyMap[D];
  if (!dayMap) return out;
  for (const room of Object.keys(dayMap)) {
    if (!dayMap[room].has(T)) continue;
    const bookedForRoom = (bookings[D] && bookings[D][room]) || [];
    const isBooked = bookedForRoom.some(b => b.time === T && b.expiresAt > nowMs());
    if (!isBooked) out.push(room);
  }
  out.sort();
  return out;
}

// API endpoints

// metadata: days + times (derived)
app.get('/api/all', (req, res) => {
  // Ordered days of the week
  const validWeekdays = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY", 
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
  ];

  // Filter & order days
  let days = Object.keys(emptyMap)
    .map(d => d.trim().toUpperCase())
    .filter(d => validWeekdays.includes(d));
  days = validWeekdays.filter(d => days.includes(d));

  // Collect all unique time slots
  const timesSet = new Set();
  for (const d of Object.keys(emptyMap)) {
    for (const r of Object.keys(emptyMap[d])) {
      for (const t of Array.from(emptyMap[d][r])) {
        const trimmed = String(t).trim();
        if (trimmed && trimmed.toLowerCase() !== "time" && trimmed.toLowerCase() !== "select time") {
          timesSet.add(trimmed);
        }
      }
    }
  }

  // Your desired chronological college order
  const preferredOrder = [
    "8-9", "9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5", "5-6"
  ];

  // Sort times based on the above list (default to end if unmatched)
  const times = Array.from(timesSet).sort((a, b) => {
    const ai = preferredOrder.indexOf(a);
    const bi = preferredOrder.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  res.json({ days, times });
});



// get available rooms: /api/rooms?day=MONDAY&time=3-4
app.get('/api/rooms', (req, res) => {
  const { day, time } = req.query;
  if (!day || !time) return res.status(400).json({ error: 'Missing day or time' });
  const rooms = getAvailableRooms(day, time);
  res.json({ day: normalizeDay(day), time: normalizeTime(time), rooms });
});

// full slot: empties + bookings details
app.get('/api/slot', (req, res) => {
  const { day, time } = req.query;
  if (!day || !time) return res.status(400).json({ error: 'Missing day or time' });
  const D = normalizeDay(day);
  const T = normalizeTime(time);
  const empties = [];
  for (const r of Object.keys(emptyMap[D] || {})) {
    if (emptyMap[D][r].has(T)) empties.push(r);
  }
  const bookingsList = [];
  for (const r of Object.keys(bookings[D] || {})) {
    for (const b of bookings[D][r]) {
      if (b.time === T && b.expiresAt > nowMs()) bookingsList.push({ room: r, token: b.token, user: b.user || null, expiresAt: b.expiresAt });
    }
  }
  res.json({ day: D, time: T, empties: empties.sort(), bookings: bookingsList });
});

// book a room
// body: { day, room, time, user (optional) }
app.post('/api/book', async (req, res) => {
  const { day, room, time, user } = req.body || {};
  if (!day || !room || !time) return res.status(400).json({ error: 'Missing fields' });
  const D = normalizeDay(day), R = normalizeRoom(room), T = normalizeTime(time);

  // Validate CSV emptiness
  if (!emptyMap[D] || !emptyMap[D][R] || !emptyMap[D][R].has(T)) {
    return res.status(400).json({ error: 'Room not listed as empty for this slot' });
  }

  // Acquire lock for safety
  await withLock(async () => {
    // check if already booked
    const existing = (bookings[D] && bookings[D][R] && bookings[D][R].some(b => b.time === T && b.expiresAt > nowMs()));
    if (existing) {
      res.status(400).json({ error: 'Room already booked' });
      return;
    }
    // Check if user already has an active booking
if (user) {
  const alreadyHasBooking = Object.values(bookings).some(dayRooms =>
    Object.values(dayRooms).some(roomArr =>
      roomArr.some(b => b.user === user && b.expiresAt > nowMs())
    )
  );
  if (alreadyHasBooking) {
    res.status(400).json({ error: 'You already have an active booking' });
    return;
  }
}

    const token = uuidv4();
    const bookedAt = nowMs();
    const expiresAt = bookedAt + BOOKING_DURATION_MS;
    if (!bookings[D]) bookings[D] = {};
    if (!bookings[D][R]) bookings[D][R] = [];
    bookings[D][R].push({ time: T, token, user: user || null, bookedAt, expiresAt });
    saveBookingsToDisk();
    io.emit('booking_update', { action: 'book', day: D, room: R, time: T, token, expiresAt });
    res.json({ success: true, token, expiresAt });
  });
});

// unbook: requires token (or will remove first matching if token not provided)
app.post('/api/unbook', async (req, res) => {
  const { day, room, time, token } = req.body || {};
  if (!day || !room || !time) return res.status(400).json({ error: 'Missing fields' });
  const D = normalizeDay(day), R = normalizeRoom(room), T = normalizeTime(time);

  await withLock(async () => {
    const arr = (bookings[D] && bookings[D][R]) || [];
    const idx = arr.findIndex(b => b.time === T && (!token || b.token === token));
    if (idx === -1) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    const removed = arr.splice(idx, 1)[0];
    if (arr.length === 0 && bookings[D]) delete bookings[D][R];
    if (bookings[D] && Object.keys(bookings[D]).length === 0) delete bookings[D];
    saveBookingsToDisk();
    io.emit('booking_update', { action: 'unbook', day: D, room: R, time: T, token: removed.token });
    res.json({ success: true });
  });
});
// get all active bookings by user
app.get('/api/user-bookings', (req, res) => {
  const user = req.query.user;
  if (!user) return res.status(400).json({ error: 'Missing user' });

  const out = [];
  for (const day of Object.keys(bookings)) {
    for (const room of Object.keys(bookings[day])) {
      for (const b of bookings[day][room]) {
        if (b.user === user && b.expiresAt > nowMs()) {
          out.push({ ...b, room, day });
        }
      }
    }
  }
  res.json({ bookings: out });
});

// admin: reload CSV from disk
app.post('/api/reload', async (req, res) => {
  await loadCSV(CSV_PATH);
  io.emit('reload', {});
  res.json({ success: true });
});

// admin: upload a new CSV file (multipart form field 'file'), saved to uploads and made canonical
app.post('/api/upload', async (req, res) => {
  if (!req.files || !req.files.file) return res.status(400).json({ error: 'No file uploaded' });
  const f = req.files.file;
  const filename = `${Date.now()}_${f.name}`;
  const savePath = path.join(UPLOADS_DIR, filename);
  try {
    await f.mv(savePath);
    // replace canonical CSV atomically
    fs.copyFileSync(savePath, CSV_PATH);
    await loadCSV(CSV_PATH);
    io.emit('reload', {});
    return res.json({ success: true, savedAs: filename });
  } catch (e) {
    console.error('Upload error', e);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// health
app.get('/', (req, res) => res.send('Empty Classroom Finder API'));

// init: load bookings and CSV
loadBookingsFromDisk();
loadCSV(CSV_PATH).catch(err => console.error('initial CSV load failed', err));

// periodic cleanup
setInterval(cleanupExpiredBookings, 60 * 1000); // every minute

io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
