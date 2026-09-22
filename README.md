# YourChat

A full-stack ChatGPT-inspired application built to understand and implement the core concepts behind modern AI chat applications.

The project includes a custom backend with authentication, chat management, real-time communication, and AI interaction, along with a React-based frontend that provides a ChatGPT-style conversational interface.

## 🚀 Live Demo

**[Open YourChat] (https://yourchat-sigma.vercel.app/login)**

> Create an account or log in to start using the application.

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Authentication through HTTP cookies
* Protected routes
* Persistent user sessions

### 💬 Chat System

* Create and manage multiple conversations
* Separate chat history
* ChatGPT-style conversation interface
* Persistent conversations
* Real-time communication using Socket.IO

### 🤖 AI Integration

* AI-powered conversational responses
* Maintains conversation context
* Streaming/real-time response handling
* Backend-controlled AI communication

### 🎨 Frontend

* React-based UI
* Responsive chat interface
* Login and registration pages
* Sidebar for conversations
* Modern dark interface
* Client-side routing

### ⚙️ Backend

* REST API architecture
* Express.js server
* MongoDB database
* JWT authentication
* Cookie-based authentication
* Socket.IO for real-time communication
* Middleware-based request handling
* Modular controller, route and model structure

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Cookie Parser
* Socket.IO

### Development Tools

* Git
* GitHub
* Postman
* MongoDB
* Vercel

---

## 📁 Project Structure

```text
ChatGPT/
│
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔄 How It Works

```text
User
  │
  ▼
React Frontend
  │
  ├── Authentication
  │
  ├── Chat Interface
  │
  └── API / Socket.IO
          │
          ▼
     Express Backend
          │
     ┌────┴────┐
     ▼         ▼
 MongoDB     AI Service
```

The frontend communicates with the backend through REST APIs and Socket.IO.

The backend handles authentication, users, conversations, messages, database operations, and communication with the AI service.

---

## 🔑 Authentication Flow

```text
Register / Login
       │
       ▼
Backend validates credentials
       │
       ▼
JWT generated
       │
       ▼
JWT stored in HTTP cookie
       │
       ▼
Protected requests
       │
       ▼
Backend verifies JWT
       │
       ▼
Authenticated user
```

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shreydev-15/ChatGPT.git
cd ChatGPT
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

---

### 3. Setup Frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will then be available through the local Vite development server.

---

## 🌐 Deployment

The frontend is deployed using Vercel.

**Live Application:**
https://yourchat-sigma.vercel.app/login

The backend can be deployed separately and connected to the frontend through environment variables.

---

## 🧠 What I Learned

This project was built primarily as a backend-focused learning project.

Through it, I worked with:

* REST API design
* Authentication and authorization
* JWT and cookies
* MongoDB and Mongoose
* Express middleware
* Protected routes
* Real-time communication with Socket.IO
* Frontend-backend integration
* API testing with Postman
* Environment variables
* Git and GitHub
* Production deployment

The main goal was not simply to recreate the ChatGPT interface, but to understand how the systems behind a real-world chat application are structured.

---

## 📌 Future Improvements

* [ ] AI response streaming
* [ ] Message editing
* [ ] Message regeneration
* [ ] Conversation search
* [ ] File and image uploads
* [ ] Markdown and code syntax highlighting
* [ ] Better mobile experience
* [ ] Conversation deletion and renaming
* [ ] Improved error handling
* [ ] Production backend deployment

---

## 👨‍💻 Author

**Shreyash Rai**

GitHub: [@shreydev-15](https://github.com/shreydev-15)

---

## ⭐ Project

If you find the project useful or interesting, consider giving the repository a star.
