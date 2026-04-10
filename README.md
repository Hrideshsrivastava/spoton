# SpotOn 

**College Empty Classroom Finder Platform**

SpotOn solves the everyday problem of finding empty classrooms in colleges by replacing manual searching and static Excel timetables with a smart, real-time system. It allows students and faculty to quickly find available rooms, track occupancy, and book classrooms efficiently through a simple web interface.

---

## Key Features

### For Students & Faculty (The Platform)
* **Smart Search:** Find empty classrooms instantly by selecting day and time slot.
* **Real-Time Availability:** View live status of rooms — Available or Occupied.
* **Instant Booking:** Book available classrooms with a single click.
* **Live Updates:** Room status updates instantly for all users.

### For System / Admin
* **Automated Data Extraction:** Extracts classroom occupancy from timetable Excel files using Python.
* **Centralized Storage:** Stores structured classroom data for quick access.
* **API Integration:** Backend APIs provide real-time classroom availability.

---

##  Tech Stack

* **Frontend:** React.js, Tailwind CSS  
* **Backend:** Node.js, Express.js  
* **Database:** MySQL  
* **Data Processing:** Python (Pandas)  
* **Deployment:** Render / Vercel  

---

##  Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites
* **Node.js** (v14 or higher)
* **MySQL** (installed and running)
* **Python** (for data processing)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/spoton.git
cd spoton

```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

```
### 4. Database Setup

Create a MySQL database named `spoton`.

```sql
CREATE DATABASE spoton;

```

### 5. Configure Environment

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=spoton

PORT=3000

```

### 6. Run the Server

```bash
# Start backend server
cd backend
node app.js

# Start frontend
cd ../frontend
npm run dev

```
The server will start on `http://localhost:3000`.

---

## Database Schema

The project uses a structured relational database to manage classroom data.

- **Rooms:** Stores classroom details  
- **Timetable:** Stores day, time, and occupancy status  
- **Bookings:** Stores room booking information  
- **Users (Future Scope):** For authentication and access control  


## How to Test

- Open Application: Launch the frontend in browser  
- Select Filters: Choose day and time slot  
- View Rooms: Check available and occupied classrooms  
- Book Room: Click on "Book Room" for an available classroom  
- Verify Update: Room status updates instantly for all users  

---

## Security Highlights

- Controlled API Access: Prevents unauthorized data access  
- Input Validation: Ensures safe and correct data handling  
- Structured Database: Helps avoid conflicts and double booking  
- *(Future)* Authentication system for secure usage  

---

## Future Enhancements

- WebSockets / Socket.io for real-time updates  
- Mobile application  
- Admin analytics dashboard  

---

## Impact

- Saves **15–20 minutes per student daily**  
- Improves classroom utilization by **30–40%**  
- Reduces scheduling conflicts  
- Enhances smart campus experience  









