# 💬 ChatVerse - Real-Time Room-Based Chat Application

<div align="center">

![ChatVerse](https://img.shields.io/badge/ChatVerse-Real--Time%20Chat-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-white?style=for-the-badge&logo=socket.io)

**A modern, real-time room-based chat application with request-based access control**

[Live Demo](https://chatverse-client.vercel.app) • [Features](#features) • [Tech Stack](#tech-stack)

</div>

---

## 🎯 Overview

ChatVerse is a full-stack real-time chat application that enables users to create rooms and chat with others through a request-based system. Users can create rooms, view active rooms, request to join rooms, and chat after approval. The application features a modern, responsive UI built with React and Tailwind CSS, and a robust backend powered by Node.js and Socket.IO.

### Key Highlights

- ⚡ **Real-Time Communication**: Instant message delivery using WebSocket connections
- 🏠 **Room-Based System**: Create and join chat rooms with request-based access
- 🎨 **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- 🚀 **Fast Performance**: Optimized for speed with React 19 and Vite
- 🔒 **Secure**: CORS-enabled backend with secure socket connections
- ☁️ **Cloud Deployed**: Frontend on Vercel, Backend on Render

## ✨ Features

### Core Features
- ✅ **Room Creation**: Users can create their own chat rooms
- ✅ **Active Room List**: View all active rooms with user counts
- ✅ **Join Requests**: Request-based system to join rooms
- ✅ **Request Management**: Room owners can accept/reject join requests
- ✅ **Real-Time Messaging**: Instant message delivery within rooms
- ✅ **User Join/Leave Notifications**: Real-time notifications when users join or leave
- ✅ **Message History**: View all messages in the chat room
- ✅ **Auto-Scroll**: Automatic scrolling to latest messages
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Modern UI**: Clean and intuitive user interface with glassmorphism

### Technical Features
- ✅ **WebSocket Integration**: Real-time bidirectional communication
- ✅ **Socket.IO Rooms**: Efficient room-based message broadcasting
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
│   │   │   ├── Join/       # Room creation page
│   │   │   ├── RoomList.jsx # Active rooms list
│   │   │   ├── Requests.jsx # Join request management
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
└── README.md               # Project documentation
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

3. **Use the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Create a room with a room name and your name
   - View active rooms and request to join
   - Room owners can accept/reject requests
   - Start chatting after approval!

### Application Flow

1. **Create Room**: Enter room name and your name to create a room
2. **View Rooms**: See all active rooms with user counts
3. **Request to Join**: Click "Request to Join" on any room
4. **Manage Requests**: Room owners see and manage join requests
5. **Chat**: After approval, users can chat in the room

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `Client`
3. Add environment variable: `VITE_SERVER_URL=https://your-backend-url.com`
4. Deploy!

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `Server`
4. Add environment variables:
   - `PORT=3000`
   - `ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`
   - `NODE_ENV=production`
5. Deploy!

## 📚 API Documentation

### Socket.IO Events

#### Client to Server

- **`createRoom`**: Create a new chat room
  ```javascript
  socket.emit('createRoom', { room: 'RoomName', user: 'Username' });
  ```

- **`getActiveRooms`**: Get list of active rooms
  ```javascript
  socket.emit('getActiveRooms');
  ```

- **`requestJoinRoom`**: Request to join a room
  ```javascript
  socket.emit('requestJoinRoom', { room: 'RoomName', user: 'Username' });
  ```

- **`acceptJoinRequest`**: Accept a join request (room owner only)
  ```javascript
  socket.emit('acceptJoinRequest', { room: 'RoomName', requestingUser: 'Username', requestingSocketId: 'socketId' });
  ```

- **`rejectJoinRequest`**: Reject a join request (room owner only)
  ```javascript
  socket.emit('rejectJoinRequest', { room: 'RoomName', requestingUser: 'Username' });
  ```

- **`joinRoom`**: Join a room after request accepted
  ```javascript
  socket.emit('joinRoom', { user: 'Username', room: 'RoomName' });
  ```

- **`message`**: Send a message
  ```javascript
  socket.emit('message', { user: 'Username', message: 'Hello!', id: socket.id });
  ```

#### Server to Client

- **`activeRooms`**: List of active rooms
- **`roomCreated`**: Room created successfully
- **`roomExists`**: Room already exists
- **`joinRequestSent`**: Join request sent
- **`joinRequestAccepted`**: Join request accepted
- **`joinRequestRejected`**: Join request rejected
- **`newJoinRequest`**: New join request (room owner)
- **`joinRequests`**: List of join requests (room owner)
- **`sendMessage`**: Receive a message
- **`userJoinedRoom`**: User joined the room
- **`userLeftRoom`**: User left the room
- **`roomDeleted`**: Room was deleted

## 🎨 UI/UX Features

- **Modern Design**: Clean and intuitive interface
- **Glassmorphism**: Beautiful glassmorphism effects
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

---

<div align="center">

**Made with ❤️ by Kartik Naphade**

[⭐ Star this repo](https://github.com/KartikNaphade2004/Chatverse) • [🐛 Report Bug](https://github.com/KartikNaphade2004/Chatverse/issues) • [💡 Request Feature](https://github.com/KartikNaphade2004/Chatverse/issues)

</div>
