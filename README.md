# 💬 ChatVerse - Real-Time Multi-User Chat Application

<div align="center">

![ChatVerse](https://img.shields.io/badge/ChatVerse-Real--Time%20Chat-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-white?style=for-the-badge&logo=socket.io)

**A modern, real-time chat application built with React, Node.js, and Socket.IO**

[Live Demo](https://chatverse-client.vercel.app) • [Documentation](#documentation) • [Features](#features) • [Tech Stack](#tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

ChatVerse is a full-stack real-time chat application that enables multiple users to communicate instantly through WebSocket connections. The application features a modern, responsive UI built with React and Tailwind CSS, and a robust backend powered by Node.js and Socket.IO.

### Key Highlights

- ⚡ **Real-Time Communication**: Instant message delivery using WebSocket connections
- 🎨 **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- 🚀 **Fast Performance**: Optimized for speed with React 19 and Vite
- 🔒 **Secure**: CORS-enabled backend with secure socket connections
- ☁️ **Cloud Deployed**: Frontend on Vercel, Backend on Render

## ✨ Features

### Core Features
- ✅ **Real-Time Messaging**: Instant message delivery and updates
- ✅ **Multi-User Support**: Multiple users can chat simultaneously
- ✅ **User Join/Leave Notifications**: Real-time notifications when users join or leave
- ✅ **Welcome Messages**: Personalized welcome messages for new users
- ✅ **Message History**: View all messages in the chat room
- ✅ **Auto-Scroll**: Automatic scrolling to latest messages
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Modern UI**: Clean and intuitive user interface

### Technical Features
- ✅ **WebSocket Integration**: Real-time bidirectional communication
- ✅ **React Router**: Client-side routing
- ✅ **State Management**: Efficient message state management
- ✅ **Environment Variables**: Configurable backend URLs
- ✅ **CORS Support**: Secure cross-origin resource sharing
- ✅ **Error Handling**: Robust error handling and connection management

## 🛠️ Tech Stack

### Frontend
- **React 19.0** - Modern UI library
- **React Router 7.4** - Client-side routing
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Vite 6.2** - Fast build tool and dev server
- **Socket.IO Client 4.8** - Real-time communication
- **Lucide React** - Beautiful icons
- **React Scroll To Bottom** - Auto-scroll functionality

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.21** - Web framework
- **Socket.IO 4.8** - Real-time bidirectional communication
- **CORS 2.8** - Cross-origin resource sharing
- **dotenv 16.4** - Environment variable management

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **GitHub** - Version control

## 📁 Project Structure

```
ChatVerse-main/
├── Client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Join/       # Join page component
│   │   │   ├── chat.jsx    # Chat room component
│   │   │   └── Message.jsx # Message component
│   │   ├── images/         # Image assets
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Public assets
│   ├── vercel.json         # Vercel configuration
│   └── package.json        # Frontend dependencies
│
├── Server/                 # Backend Node.js Application
│   ├── app.js              # Main server file
│   └── package.json        # Backend dependencies
│
├── README.md               # Project documentation
├── DEPLOYMENT.md           # Deployment guide
└── VERCEL_DEPLOYMENT.md    # Vercel deployment guide
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KartikNaphade2004/Chatverse.git
   cd ChatVerse-main
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd Client
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../Server
   npm install
   ```

4. **Environment Variables**

   Create a `.env` file in the `Server` directory:
   ```env
   PORT=3000
   ALLOWED_ORIGINS=http://localhost:5173
   NODE_ENV=development
   ```

   Create a `.env` file in the `Client` directory:
   ```env
   VITE_SERVER_URL=http://localhost:3000
   ```

## 💻 Usage

### Running the Application Locally

1. **Start the Backend Server**
   ```bash
   cd Server
   npm start
   ```
   The server will start on `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd Client
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Enter your name and click "Join"
   - Start chatting!

### Building for Production

1. **Build the Frontend**
   ```bash
   cd Client
   npm run build
   ```

2. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set root directory to `Client`
   - Add environment variable: `VITE_SERVER_URL=https://your-backend-url.com`
   - Deploy!

   See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

### Backend Deployment (Render)

1. **Deploy to Render**
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set root directory to `Server`
   - Add environment variables:
     - `PORT=3000`
     - `ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`
     - `NODE_ENV=production`
   - Deploy!

   See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📚 API Documentation

### Socket.IO Events

#### Client to Server

- **`joined`**: User joins the chat
  ```javascript
  socket.emit('joined', { user: 'username' });
  ```

- **`message`**: Send a message
  ```javascript
  socket.emit('message', { user: 'username', message: 'Hello!', id: socket.id });
  ```

- **`leave`**: User leaves the chat
  ```javascript
  socket.emit('leave', { user: 'username' });
  ```

#### Server to Client

- **`welcome`**: Welcome message for new user
  ```javascript
  socket.on('welcome', (data) => {
    console.log(data.user, data.message);
  });
  ```

- **`userJoined`**: Notification when a user joins
  ```javascript
  socket.on('userJoined', (data) => {
    console.log(data.user, data.message);
  });
  ```

- **`sendMessage`**: Receive a message
  ```javascript
  socket.on('sendMessage', (data) => {
    console.log(data.user, data.message);
  });
  ```

- **`leave`**: Notification when a user leaves
  ```javascript
  socket.on('leave', (data) => {
    console.log(data.user, data.message);
  });
  ```

### REST API Endpoints

- **GET `/`**: Health check endpoint
  ```bash
  curl http://localhost:3000/
  ```
  Response: `server working`

## 🎨 UI/UX Features

- **Modern Design**: Clean and intuitive interface
- **Responsive Layout**: Works on all devices
- **Smooth Animations**: Enhanced user experience
- **Auto-Scroll**: Automatically scrolls to latest messages
- **Real-Time Updates**: Instant message delivery
- **User-Friendly**: Easy to use and navigate

## 🔧 Configuration

### Frontend Configuration

- **Backend URL**: Set `VITE_SERVER_URL` in environment variables
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for utility-first styling

### Backend Configuration

- **Port**: Set `PORT` in environment variables (default: 3000)
- **CORS**: Configure `ALLOWED_ORIGINS` for frontend URLs
- **Environment**: Set `NODE_ENV` for production/development

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 👨‍💻 Author

**Kartik Naphade**

- GitHub: [@KartikNaphade2004](https://github.com/KartikNaphade2004)
- Project Link: [https://github.com/KartikNaphade2004/Chatverse](https://github.com/KartikNaphade2004/Chatverse)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

## 📊 Project Status

✅ **Status**: Active Development
✅ **Version**: 1.0.0
✅ **Last Updated**: December 2024

---

<div align="center">

**Made with ❤️ by Kartik Naphade**

[⭐ Star this repo](https://github.com/KartikNaphade2004/Chatverse) • [🐛 Report Bug](https://github.com/KartikNaphade2004/Chatverse/issues) • [💡 Request Feature](https://github.com/KartikNaphade2004/Chatverse/issues)

</div>

