import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from "socket.io";
import cors from 'cors'
dotenv.config();
const app = express();
// CORS configuration - allow both localhost and hosted deployments
const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://chatverse.vercel.app',
    'https://chatverse-gjif543m5-kartik-naphades-projects.vercel.app',
    'https://chatverse-3k62u031u-kartik-naphades-projects.vercel.app'
];

if (process.env.VERCEL_URL) {
    defaultAllowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : defaultAllowedOrigins;

const isOriginAllowed = (origin) => {
    if (!origin) {
        return process.env.NODE_ENV !== 'production';
    }

    if (allowedOrigins.includes(origin)) {
        return true;
    }

    try {
        const { hostname } = new URL(origin);
        if (hostname.endsWith('.vercel.app')) {
            return true;
        }
    } catch (error) {
        console.warn(`Invalid origin format received for CORS check: ${origin}`);
    }

    return false;
};

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const port = process.env.PORT || 3000; 

// Store rooms: { roomName: { owner: string, users: { socketId: user }, joinRequests: [{user, socketId}] } }
const rooms = {};
// Store socket to room mapping: { socketId: roomName }
const socketToRoom = {};

// Get active rooms list
const getActiveRooms = () => {
    return Object.keys(rooms).map(roomName => ({
        name: roomName,
        owner: rooms[roomName].owner,
        userCount: Object.keys(rooms[roomName].users || {}).length
    }));
};

io.on("connection",(socket)=>{
    console.log(`New connection: ${socket.id}`);

    // Create a room
    socket.on('createRoom', ({user, room})=>{
        if (!room || !user) {
            socket.emit('error', { message: 'Room and user are required' });
            return;
        }

        if (rooms[room]) {
            socket.emit('roomExists', { message: 'Room already exists' });
            return;
        }

        // Create new room
        rooms[room] = {
            owner: user,
            users: {},
            joinRequests: []
        };

        // Add creator as first user
        rooms[room].users[socket.id] = user;
        socketToRoom[socket.id] = room;
        socket.join(room);

        console.log(`Room created: ${room} by ${user}`);
        
        socket.emit('roomCreated', { room, user });
        
        // Broadcast new room to all clients
        io.emit('activeRooms', getActiveRooms());
    });

    // Get active rooms
    socket.on('getActiveRooms', ()=>{
        socket.emit('activeRooms', getActiveRooms());
    });

    // Request to join a room
    socket.on('requestJoinRoom', ({user, room})=>{
        if (!room || !user) {
            socket.emit('error', { message: 'Room and user are required' });
            return;
        }

        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Check if user is already in room
        const isInRoom = Object.values(rooms[room].users).includes(user);
        if (isInRoom) {
            socket.emit('error', { message: 'You are already in this room' });
            return;
        }

        // Add join request
        rooms[room].joinRequests.push({
            user: user,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });

        console.log(`${user} requested to join ${room}`);

        // Notify room owner
        const ownerSocketId = Object.keys(rooms[room].users).find(
            sid => rooms[room].users[sid] === rooms[room].owner
        );
        
        if (ownerSocketId) {
            io.to(ownerSocketId).emit('newJoinRequest', {
                room: room,
                user: user,
                socketId: socket.id
            });
        }

        socket.emit('joinRequestSent', { room, user });
    });

    // Accept join request
    socket.on('acceptJoinRequest', ({room, requestingUser, requestingSocketId})=>{
        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Check if current user is room owner
        const isOwner = rooms[room].users[socket.id] === rooms[room].owner;
        if (!isOwner) {
            socket.emit('error', { message: 'Only room owner can accept requests' });
            return;
        }

        // Remove from join requests
        rooms[room].joinRequests = rooms[room].joinRequests.filter(
            req => req.user !== requestingUser
        );

        // Add user to room
        rooms[room].users[requestingSocketId] = requestingUser;
        socketToRoom[requestingSocketId] = room;
        
        // Make requesting user join the room
        io.to(requestingSocketId).emit('joinRequestAccepted', { room });
        
        // Notify all users in room
        io.to(room).emit('userJoinedRoom', {
            user: requestingUser,
            room: room,
            timestamp: new Date().toISOString()
        });

        // Send updated room users list
        const roomUsers = Object.values(rooms[room].users);
        io.to(room).emit('roomUsersUpdate', roomUsers);

        console.log(`${requestingUser} joined ${room}`);
    });

    // Reject join request
    socket.on('rejectJoinRequest', ({room, requestingUser})=>{
        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Check if current user is room owner
        const isOwner = rooms[room].users[socket.id] === rooms[room].owner;
        if (!isOwner) {
            socket.emit('error', { message: 'Only room owner can reject requests' });
            return;
        }

        // Remove from join requests
        rooms[room].joinRequests = rooms[room].joinRequests.filter(
            req => req.user !== requestingUser
        );

        // Find requesting user's socket
        const request = rooms[room].joinRequests.find(req => req.user === requestingUser);
        if (request) {
            io.to(request.socketId).emit('joinRequestRejected', { room });
        }

        console.log(`Join request from ${requestingUser} rejected for ${room}`);
    });

    // Get join requests for a room (room owner only)
    socket.on('getJoinRequests', ({room})=>{
        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Check if current user is room owner
        const isOwner = rooms[room].users[socket.id] === rooms[room].owner;
        if (!isOwner) {
            socket.emit('error', { message: 'Only room owner can view requests' });
            return;
        }

        socket.emit('joinRequests', rooms[room].joinRequests);
    });

    // Join room (after request accepted)
    socket.on('joinRoom', ({user, room})=>{
        if (!room || !user) {
            socket.emit('error', { message: 'Room and user are required' });
            return;
        }

        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Check if user is allowed in room
        if (!rooms[room].users[socket.id]) {
            socket.emit('error', { message: 'You are not authorized to join this room' });
            return;
        }

        socket.join(room);
        console.log(`${user} joined room: ${room}`);

        // Send room users list
        const roomUsers = Object.values(rooms[room].users).filter(u => u !== user);
        socket.emit('roomUsers', roomUsers);

        // Notify others in the room
        socket.to(room).emit('userJoinedRoom', {
            user: user,
            room: room,
            timestamp: new Date().toISOString()
        });

        // Send updated room users list
        const updatedRoomUsers = Object.values(rooms[room].users);
        io.to(room).emit('roomUsersUpdate', updatedRoomUsers);
    });

    // Get room users
    socket.on('getRoomUsers', ({room})=>{
        if (!room || !rooms[room]) {
            socket.emit('roomUsers', []);
            return;
        }

        const roomUsers = Object.values(rooms[room].users);
        const currentUser = rooms[room].users[socket.id];
        const otherUsers = roomUsers.filter(u => u !== currentUser);
        
        socket.emit('roomUsers', otherUsers);
    });

    // Send message in room
    socket.on('message', ({message, id})=>{
        const room = socketToRoom[id];
        if (room && rooms[room] && rooms[room].users[id] && message){
            const user = rooms[room].users[id];
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
        if (room && rooms[room] && rooms[room].users[socket.id]){
            const leavingUser = rooms[room].users[socket.id];
            const isOwner = leavingUser === rooms[room].owner;
            
            delete rooms[room].users[socket.id];
            delete socketToRoom[socket.id];
            
            // If owner leaves, delete room
            if (isOwner) {
                // Notify all users in room
                io.to(room).emit('roomDeleted', { room });
                delete rooms[room];
                // Broadcast updated room list
                io.emit('activeRooms', getActiveRooms());
                console.log(`Room ${room} deleted by owner`);
            } else {
                // If room is empty, delete it
                if (Object.keys(rooms[room].users).length === 0) {
                    delete rooms[room];
                    io.emit('activeRooms', getActiveRooms());
                } else {
                    // Notify others in the room
                    socket.to(room).emit('userLeftRoom', {
                        user: leavingUser,
                        room: room,
                        timestamp: new Date().toISOString()
                    });

                    // Send updated room users list
                    const updatedRoomUsers = Object.values(rooms[room].users);
                    io.to(room).emit('roomUsersUpdate', updatedRoomUsers);
                }
            }
            
            console.log(`${leavingUser} left room: ${room}`);
        }
    });
});

app.get("/",(req,res)=>{
    res.send(`server working`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
