# 🛠️ Mini CRM Dashboard

A simplified CRM system built with:

- **Frontend**: React.js
- **Backend**: Node.js (Express)
- **Database**: MySQL
- **Dockerized Full Stack**: Docker & Docker Compose

Designed for performance, scalability, and real-world deployment readiness.

---

## 🔧 Core Features

- **Customer Management**: Add, edit, and delete customers (fields: name, email, phone, company)
- **Tagging System**: Assign multiple tags (Lead, Prospect, Client, etc.)
- **Search & Filter**: By name, email, phone, and tags
- **CSV Upload**: Upload up to 1 million customer records with validation (email format, required fields, duplicates, etc.)
- **Backend API**: RESTful, built with Node.js & Express
- **Frontend**: ReactJS, responsive, clean UI
- **Authentication**: Basic token-based authentication (login, registration)
- **Dockerized**: Full-stack deployment with Docker Compose

---

Backend Setup
cd backend
npm install


Start the backend:
npm start

Frontend Setup
cd frontend
npm install
npm start

CSV Upload Instructions
Navigate to the Upload page.

Upload a .csv file with the following headers:
name,email,phone,company,tags


Import the database and change the database password in server.js
