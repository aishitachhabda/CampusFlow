# CampusFlow — Campus Resource Demand Dashboard

A React + Express + MySQL dashboard designed as an extra-effort user-facing application for the Campus Resource Demand & Crowd Prediction Deep Learning capstone.

## Main features

### Student/user side
- Google/Gmail authentication
- Minimal, student-friendly dashboard
- Current crowd status for Canteen, Amul, Snackify and Nescafe
- Upload a current image for on-the-spot crowd classification
- Ask: "Is it okay to visit at XYZ time?"
- Best-time-to-visit suggestions
- Current status cards
- Recent predictions
- Responsive UI

### Developer/admin side
- User registration/login records
- Google account email/name/provider information
- Last login and login count
- Access/event logging
- Admin endpoint for users and access logs
- MySQL persistence

### Deep Learning integration
The dashboard is intentionally separated from the model layer.

The backend exposes:
- POST /api/predictions/image
- GET /api/predictions/forecast
- GET /api/predictions/best-times
- GET /api/dashboard/overview

Initially, these endpoints use a clearly marked mock prediction service so the web app can run before the trained Python models are deployed.

Replace `server/src/services/predictionService.js` with calls to your trained:
- LSTM/GRU temporal model
- CNN/MobileNetV2 image model

## Tech stack

Frontend:
- React
- Vite
- React Router
- Axios
- @react-oauth/google
- Lucide React
- CSS

Backend:
- Node.js
- Express
- MySQL2
- Google Auth Library
- Multer
- Helmet
- CORS
- Morgan
- express-rate-limit
- JSON Web Token

Database:
- MySQL 8+

## Folder structure

campus_resource_dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db.js
│   │   └── index.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
└── README.md

## 1. Create Google OAuth credentials

In Google Cloud Console:

1. Create/select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a Web application.
4. Add your local development origin, for example:
   http://localhost:5173
5. Copy the client ID.

Put the client ID into:

client/.env

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Put the same Google client ID into:

server/.env

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

For production, add your real frontend origin to Google's authorized JavaScript origins and use HTTPS.

## 2. Create the MySQL database

Open MySQL Workbench/phpMyAdmin and run:

database/schema.sql

This creates:
- campusflow database
- users
- login_events
- prediction_logs

The `prediction_logs` table is designed to store:
- current image predictions
- future-time predictions
- predicted crowd score
- predicted class
- recommendation

## 3. Backend setup

Open terminal:

cd server
npm install

Copy:

.env.example -> .env

Then fill in:

PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_PASSWORD
MYSQL_DATABASE=campusflow
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
JWT_SECRET=use-a-long-random-secret
ADMIN_EMAILS=yourgmail@gmail.com

Start:

npm run dev

## 4. Frontend setup

Open another terminal:

cd client
npm install

Copy:

.env.example -> .env

Set:

VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Start:

npm run dev

Open:

http://localhost:5173

## 5. Developer/admin access

Set your Gmail in:

ADMIN_EMAILS=yourgmail@gmail.com

After logging in with that Google account, visit:

/admin

The admin dashboard shows:
- total registered users
- recent logins
- login count
- last login
- prediction activity

## 6. Connecting the real Deep Learning models

The web dashboard is not supposed to retrain the model.

Recommended production architecture:

React
  ↓
Express API
  ↓
Python FastAPI model service
  ↓
LSTM/GRU + CNN/MobileNetV2
  ↓
prediction response
  ↓
MySQL logging
  ↓
React dashboard

The current Node service returns demo predictions so the UI works immediately.

When your Colab models are finalized, export them and create a small Python FastAPI service. Then change:

server/src/services/predictionService.js

to call that service.

## Important security note

Google authentication proves the user's Google identity. The backend verifies the Google ID token using Google's public verification infrastructure before creating/updating the local user record.

Do NOT:
- store Google passwords
- store access tokens unnecessarily
- expose MYSQL credentials in React
- put JWT secrets in the frontend
- trust an email sent by the browser without verifying the Google token

## Suggested presentation to teacher

Show this flow:

1. Student opens CampusFlow.
2. Logs in with college Gmail.
3. Dashboard shows current campus resource status.
4. Selects Canteen/Amul/Snackify/Nescafe.
5. Uploads a current image.
6. CNN classifies Free / Moderate / Busy.
7. Student enters 2:30 PM.
8. LSTM/GRU gives expected crowd.
9. Dashboard says:
   - "Good time to visit"
   - "Moderate waiting expected"
   - "Try another time"
10. Open developer/admin dashboard.
11. Show that registered users and access/login events are being recorded in MySQL.

This demonstrates the complete chain:
Deep Learning → Backend API → DBMS → Authentication → User Interface → Decision Support.
