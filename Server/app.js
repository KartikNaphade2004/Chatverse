import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from "socket.io";
import cors from 'cors'
dotenv.config();
const app = express();
// CORS configuration - allow both localhost and Vercel deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true, // Allow all in development
        credentials: true,
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) only in development
        if (!origin) {
            if (process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS - no origin'));
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
            // In development, allow all origins for easier testing
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const port = process.env.PORT || 3000; 
// Store users by room: { roomName: { socketId: { user, room } } }
const rooms = {};
// Store socket to room mapping: { socketId: roomName }
const socketToRoom = {};

io.on("connection",(socket)=>{
    console.log(`New connection: ${socket.id}`);

    // Join a room
    socket.on('joinRoom', ({user, room})=>{
        if (!room || !user) {
            socket.emit('error', { message: 'Room and user are required' });
            return;
        }

        // Store user in room
        if (!rooms[room]) {
            rooms[room] = {};
        }
        rooms[room][socket.id] = { user, room };
        socketToRoom[socket.id] = room;
        socket.join(room);

        console.log(`${user} joined room: ${room}`);
        
        // Send room users list to the new user (excluding current user)
        const roomUsers = Object.values(rooms[room])
            .map(u => u.user)
            .filter(u => u !== user);
        socket.emit('roomUsers', roomUsers);
        
        // Notify others in the room
        socket.to(room).emit('userJoinedRoom', {
            user: user,
            room: room,
            timestamp: new Date().toISOString()
        });

        // Send updated room users list to all in room
        const updatedRoomUsers = Object.values(rooms[room]).map(u => u.user);
        io.to(room).emit('roomUsersUpdate', updatedRoomUsers);
    });

    // Get room users (for requests page)
    socket.on('getRoomUsers', ({room})=>{
        if (!room) {
            socket.emit('error', { message: 'Room is required' });
            return;
        }

        if (rooms[room]) {
            // Get all users in the room
            const roomUsers = Object.values(rooms[room]).map(u => u.user);
            
            // Filter out current user
            const currentUser = rooms[room][socket.id]?.user;
            const otherUsers = roomUsers.filter(u => u !== currentUser);
            
            socket.emit('roomUsers', otherUsers);
        } else {
            socket.emit('roomUsers', []);
        }
    });

    // Send message in room
    socket.on('message', ({message, id})=>{
        const room = socketToRoom[id];
        if (room && rooms[room] && rooms[room][id] && message){
            const user = rooms[room][id].user;
            io.to(room).emit('sendMessage', {
                user: user,
                message: message,
                id: id,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Disconnect
    socket.on('disconnect', ()=>{
        const room = socketToRoom[socket.id];
        if (room && rooms[room] && rooms[room][socket.id]){
            const leavingUser = rooms[room][socket.id].user;
            delete rooms[room][socket.id];
            delete socketToRoom[socket.id];
            
            // If room is empty, delete it
            if (Object.keys(rooms[room]).length === 0) {
                delete rooms[room];
            } else {
                // Notify others in the room
                socket.to(room).emit('userLeftRoom', {
                    user: leavingUser,
                    room: room,
                    timestamp: new Date().toISOString()
                });

                // Send updated room users list
                const updatedRoomUsers = Object.values(rooms[room]).map(u => u.user);
                io.to(room).emit('roomUsersUpdate', updatedRoomUsers);
            }
            
            console.log(`${leavingUser} left room: ${room}`);
        }
    });
});

app.get("/",(req,res)=>{
    res.send(`server working`);
});

server.listen(port, async()=>{
    console.log(`Server is running on port ${port}`);
});
