# 💬 ChatVerse - Real-Time Chat Application

<div align="center">

![ChatVerse](https://img.shields.io/badge/ChatVerse-Real--Time%20Chat-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-white?style=for-the-badge&logo=socket.io)

**A modern, real-time chat application with request-based access control**

[Live Demo](https://chatverse-client.vercel.app) • [Features](#-features) • [Tech Stack](#-tech-stack)

</div>

---

## 🎯 Overview

ChatVerse is a full-stack real-time chat application featuring a simplified request-based system. Users can request to join the main chat room, and existing members can accept or reject requests. The application features a professional, responsive UI built with React and Tailwind CSS, and a robust backend powered by Node.js and Socket.IO.

### Key Highlights

- ⚡ **Real-Time Communication**: Instant message delivery using WebSocket connections
- 🎨 **Professional UI/UX**: Beautiful design with glassmorphism effects, animations, and toast notifications
- 📱 **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- 🚀 **Fast Performance**: Optimized with React 19, custom hooks, and Vite
- 🔒 **Secure**: CORS-enabled backend with secure socket connections
- ☁️ **Cloud Deployed**: Frontend on Vercel, Backend on Render
- 🎯 **Simple Flow**: Easy-to-use request/acceptance system

## ✨ Features

### Core Features

- ✅ **Request-Based Access**: Users request to join the main chat room
- ✅ **Auto-Accept First User**: First user automatically gets access
- ✅ **Request Management**: Room members can accept/reject join requests
- ✅ **Real-Time Messaging**: Instant message delivery within the room
- ✅ **User Join/Leave Notifications**: Real-time notifications when users join or leave
- ✅ **Message History**: View all messages in the chat room
- ✅ **Auto-Scroll**: Automatic scrolling to latest messages
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Professional UI**: Modern interface with animations and toast notifications

### React Features

- ✅ **Custom Hooks**: `useToast` for notifications, `useSocket` for socket management
- ✅ **React Patterns**: `useCallback`, `useMemo`, `Suspense` for optimal performance
- ✅ **Toast Notifications**: Beautiful toast system for user feedback
- ✅ **Loading States**: Professional loading spinners and page loaders
- ✅ **Smooth Animations**: Fade-in, slide-in, and scale animations
- ✅ **Form Validation**: Real-time username validation

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

- **React 19.0** - Modern UI library with hooks
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

### Deployment

- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **GitHub** - Version control

## 📁 Project Structure

```
ChatVerse/
├── Client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Join/       # Login/name entry page
│   │   │   ├── SimpleRequest.jsx # Request to join page
│   │   │   ├── chat.jsx    # Chat room component
│   │   │   ├── Message.jsx # Message component
│   │   │   ├── Toast.jsx   # Toast notification component
│   │   │   └── LoadingSpinner.jsx # Loading components
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useToast.js # Toast notification hook
│   │   │   └── useSocket.js # Socket management hook
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
   cd Chatverse
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
   - Enter your name and continue
   - Request to join the main chat room
   - First user gets auto-accepted, others wait for approval
   - Room members can accept/reject requests
   - Start chatting after approval!

### Application Flow

1. **Enter Name**: Enter your name (2-20 characters)
2. **Request to Join**: Click "Request to Join" on the main chat room
3. **Auto-Accept (First User)**: First user automatically gets access
4. **Wait for Approval**: Subsequent users wait for room members to approve
5. **Manage Requests**: Room members see and manage join requests
6. **Chat**: After approval, users can chat in the room

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `Client`
3. Add environment variable: `VITE_SERVER_URL=https://your-backend-url.onrender.com`
4. Deploy!

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `Server`
4. Set start command: `node app.js`
5. Add environment variables:
   - `PORT=3000`
   - `ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`
   - `NODE_ENV=production`
6. Deploy!

## 📚 API Documentation

### Socket.IO Events

#### Client to Server

- **`checkAccess`**: Check if user has access to room
  ```javascript
  socket.emit('checkAccess', { user: 'Username', room: 'Main Chat Room' });
  ```

- **`requestJoinRoom`**: Request to join the main room
  ```javascript
  socket.emit('requestJoinRoom', { room: 'Main Chat Room', user: 'Username' });
  ```

- **`acceptJoinRequest`**: Accept a join request (room members only)
  ```javascript
  socket.emit('acceptJoinRequest', { room: 'Main Chat Room', requestingUser: 'Username', requestingSocketId: 'socketId' });
  ```

- **`rejectJoinRequest`**: Reject a join request (room members only)
  ```javascript
  socket.emit('rejectJoinRequest', { room: 'Main Chat Room', requestingUser: 'Username' });
  ```

- **`getJoinRequests`**: Get list of join requests
  ```javascript
  socket.emit('getJoinRequests', { room: 'Main Chat Room' });
  ```

- **`joinRoom`**: Join a room after request accepted
  ```javascript
  socket.emit('joinRoom', { user: 'Username', room: 'Main Chat Room' });
  ```

- **`message`**: Send a message
  ```javascript
  socket.emit('message', { user: 'Username', message: 'Hello!', id: socket.id });
  ```

#### Server to Client

- **`hasAccess`**: User has access to room
- **`noAccess`**: User doesn't have access
- **`joinRequestSent`**: Join request sent successfully
- **`joinRequestAccepted`**: Join request accepted
- **`joinRequestRejected`**: Join request rejected
- **`newJoinRequest`**: New join request (room members)
- **`joinRequests`**: List of join requests
- **`sendMessage`**: Receive a message
- **`userJoinedRoom`**: User joined the room
- **`userLeftRoom`**: User left the room
- **`roomUsersUpdate`**: Updated list of room users

## 🎨 UI/UX Features

- **Professional Design**: Clean and intuitive interface with glassmorphism
- **Toast Notifications**: Beautiful toast system for user feedback
- **Smooth Animations**: Fade-in, slide-in, and scale animations
- **Loading States**: Professional loading spinners
- **Form Validation**: Real-time username validation with visual feedback
- **Responsive Layout**: Works on all devices
- **Auto-Scroll**: Automatically scrolls to latest messages
- **Real-Time Updates**: Instant message delivery
- **Connection Status**: Visual connection indicators

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
