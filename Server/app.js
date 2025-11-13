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
    'https://chatverse-client.vercel.app',
    'https://chatverse-client-6n6eqbp69-kartik-naphades-projects.vercel.app',
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
        // Allow server-to-server or health-check requests with no origin
        return true;
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

const corsOriginHandler = (origin, callback) => {
    if (isOriginAllowed(origin)) {
        callback(null, true);
    } else {
        console.warn(`[CORS] Blocked origin: ${origin ?? 'undefined'}`);
        callback(new Error('Not allowed by CORS'));
    }
};

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsOriginHandler,
        credentials: true,
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: corsOriginHandler,
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

// Initialize main room if it doesn't exist
const MAIN_ROOM = "Main Chat Room";
if (!rooms[MAIN_ROOM]) {
    rooms[MAIN_ROOM] = {
        owner: "System",
        users: {},
        joinRequests: []
    };
}

io.on("connection",(socket)=>{
    console.log(`New connection: ${socket.id}`);

    // Check if user has access to a room
    socket.on('checkAccess', ({user, room}) => {
        if (!room || !user) {
            socket.emit('error', { message: 'Room and user are required' });
            return;
        }

        if (!rooms[room]) {
            socket.emit('noAccess', {});
            return;
        }

        // Check if user is already in room
        const userInRoom = Object.entries(rooms[room].users).find(
            ([socketId, username]) => username === user
        );

        if (userInRoom) {
            socket.emit('hasAccess', { room });
        } else {
            socket.emit('noAccess', {});
        }
    });

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

        // Auto-create main room if it doesn't exist
        if (room === MAIN_ROOM && !rooms[room]) {
            rooms[room] = {
                owner: user, // First requester becomes owner
                users: {},
                joinRequests: []
            };
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

        // SIMPLE LOGIC: If room is empty, auto-accept first user
        const roomUserCount = Object.keys(rooms[room].users).length;
        if (roomUserCount === 0) {
            // Auto-accept - room is empty, first user gets in automatically
            rooms[room].users[socket.id] = user;
            rooms[room].owner = user; // First user becomes owner
            socketToRoom[socket.id] = room;
            socket.join(room);
            
            console.log(`${user} auto-joined ${room} (first user), socket: ${socket.id}`);
            console.log(`Room users after join:`, rooms[room].users);
            
            // Notify user they're accepted (but don't navigate - let them see requests)
            socket.emit('joinRequestAccepted', { room });
            
            // Also send hasAccess so they know they're in room
            socket.emit('hasAccess', { room });
            
            // Send empty user list (they're the first one)
            socket.emit('roomUsers', []);
            socket.emit('roomUsersUpdate', []);
            
            // Send empty requests list (they're the first one)
            socket.emit('joinRequests', []);
            
            return;
        }

        // Room has users - add to join requests
        const newRequest = {
            user: user,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        };
        rooms[room].joinRequests.push(newRequest);

        console.log(`${user} requested to join ${room}`);
        console.log(`Current requests in room:`, rooms[room].joinRequests);
        console.log(`Users in room (socket IDs):`, Object.keys(rooms[room].users));
        console.log(`Room socket members:`, Array.from(io.sockets.adapter.rooms.get(room) || []));

        // Notify all users in room about new request
        io.to(room).emit('newJoinRequest', {
            room: room,
            user: user,
            socketId: socket.id
        });
        
        // CRITICAL: Immediately send updated requests list to ALL users in room
        const requestsToSend = rooms[room].joinRequests;
        console.log(`Broadcasting ${requestsToSend.length} requests to room ${room}`);
        io.to(room).emit('joinRequests', requestsToSend);

        socket.emit('joinRequestSent', { room, user });
    });

    // Accept join request
    socket.on('acceptJoinRequest', ({room, requestingUser, requestingSocketId})=>{
        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Allow any user in the room to accept requests (simplified)
        const currentUser = rooms[room].users[socket.id];
        if (!currentUser) {
            socket.emit('error', { message: 'You must be in the room to accept requests' });
            return;
        }

        // Remove from join requests
        rooms[room].joinRequests = rooms[room].joinRequests.filter(
            req => req.user !== requestingUser
        );

        // CRITICAL: Add user to room - use a placeholder socket ID that will be updated when they join chat
        // The actual socket ID will be updated when they navigate to chat page
        // For now, we mark them as accepted by storing their username
        // When they join chat, we'll update with their actual socket ID
        
        // Check if user already exists in room (by username)
        const existingSocketId = Object.keys(rooms[room].users).find(
            sid => rooms[room].users[sid] === requestingUser
        );
        
        if (existingSocketId) {
            // User already in room, just update socket ID
            delete rooms[room].users[existingSocketId];
            delete socketToRoom[existingSocketId];
        }
        
        // Add user with their current socket ID (from request page)
        rooms[room].users[requestingSocketId] = requestingUser;
        socketToRoom[requestingSocketId] = room;
        
        console.log(`Added ${requestingUser} to room ${room} with socket ${requestingSocketId}`);
        console.log(`Room users now:`, rooms[room].users);
        console.log(`All users in room by name:`, Object.values(rooms[room].users));
        
        // Make requesting user join the room socket room
        const requestingSocket = io.sockets.sockets.get(requestingSocketId);
        if (requestingSocket) {
            requestingSocket.join(room);
            console.log(`${requestingUser} (socket: ${requestingSocketId}) joined socket room ${room}`);
            
            // Verify socket is in room
            const roomSockets = Array.from(io.sockets.adapter.rooms.get(room) || []);
            console.log(`Room ${room} now has ${roomSockets.length} sockets:`, roomSockets);
            
            // Notify requesting user they're accepted
            requestingSocket.emit('joinRequestAccepted', { room });
            
            // Send room users to the newly accepted user (excluding themselves)
            const roomUsers = Object.values(rooms[room].users);
            const otherUsers = roomUsers.filter(u => u !== requestingUser);
            requestingSocket.emit('roomUsers', otherUsers);
            console.log(`Sent ${otherUsers.length} users to ${requestingUser}:`, otherUsers);
        } else {
            console.error(`ERROR: Socket ${requestingSocketId} not found for user ${requestingUser}`);
            // Even if socket not found, user is still added to room - they can join with new socket later
            console.log(`User ${requestingUser} added to room but socket not found - will update on chat join`);
        }
        
        // Notify all other users in room about the new user
        socket.to(room).emit('userJoinedRoom', {
            user: requestingUser,
            room: room,
            timestamp: new Date().toISOString()
        });

        // Send updated room users list to all users in room (excluding the new user)
        const roomUsers = Object.values(rooms[room].users);
        const otherUsers = roomUsers.filter(u => u !== requestingUser);
        socket.to(room).emit('roomUsersUpdate', otherUsers);
        
        // Also send to the new user (excluding themselves)
        if (requestingSocket) {
            requestingSocket.emit('roomUsersUpdate', otherUsers);
        }

        console.log(`${requestingUser} joined ${room} via acceptance`);
    });

    // Reject join request
    socket.on('rejectJoinRequest', ({room, requestingUser})=>{
        if (!rooms[room]) {
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Allow any user in the room to reject requests (simplified)
        const currentUser = rooms[room].users[socket.id];
        if (!currentUser) {
            socket.emit('error', { message: 'You must be in the room to reject requests' });
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

    // Get join requests for a room (any user in room can see)
    socket.on('getJoinRequests', ({room})=>{
        console.log(`getJoinRequests called for room: ${room}, socket: ${socket.id}`);
        
        if (!rooms[room]) {
            console.log(`Room ${room} does not exist`);
            socket.emit('joinRequests', []);
            return;
        }

        // Check if user is in room by socket ID
        const currentUser = rooms[room].users[socket.id];
        console.log(`Current user check:`, currentUser, `Users in room:`, rooms[room].users);
        
        if (currentUser) {
            // User is in room, send them the requests
            console.log(`Sending ${rooms[room].joinRequests.length} requests to ${currentUser}`);
            socket.emit('joinRequests', rooms[room].joinRequests || []);
        } else {
            // If not in room, still send empty array (for request page)
            console.log(`User not in room, sending empty requests`);
            socket.emit('joinRequests', []);
        }
    });

    // Join room (after request accepted OR user navigating to chat)
    socket.on('joinRoom', ({user, room})=>{
        if (!room || !user) {
            socket.emit('error', { message: 'Room and user are required' });
            return;
        }

        // CRITICAL: Auto-create MAIN_ROOM if it doesn't exist
        if (room === MAIN_ROOM && !rooms[room]) {
            console.log(`Auto-creating ${MAIN_ROOM} as it doesn't exist`);
            rooms[room] = {
                owner: user,
                users: {},
                joinRequests: []
            };
        }

        if (!rooms[room]) {
            console.error(`Room ${room} does not exist and cannot be created`);
            socket.emit('error', { message: 'Room does not exist' });
            return;
        }

        // Check if user is already in room (by username, not socket.id)
        // This handles: user was accepted, then navigated to chat with new socket
        const userSocketId = Object.keys(rooms[room].users).find(
            sid => rooms[room].users[sid] === user
        );

        if (userSocketId) {
            // User is already in room - just update socket ID (normal when navigating to chat)
            console.log(`User ${user} already in room with socket ${userSocketId}, updating to ${socket.id}`);
            
            // Remove old socket from room
            if (userSocketId !== socket.id) {
                const oldSocket = io.sockets.sockets.get(userSocketId);
                if (oldSocket) {
                    oldSocket.leave(room);
                    console.log(`Removed old socket ${userSocketId} from room`);
                }
                delete rooms[room].users[userSocketId];
                delete socketToRoom[userSocketId];
            }
        } else {
            // User NOT in room - check if they have a pending request
            const hasPendingRequest = rooms[room].joinRequests.some(req => req.user === user);
            
            if (hasPendingRequest) {
                console.log(`User ${user} has pending request but not yet accepted`);
                socket.emit('error', { message: 'Your request is pending. Please wait for approval.' });
                return;
            } else {
                console.error(`User ${user} not found in room ${room} and no pending request`);
                console.error(`Room users:`, Object.values(rooms[room].users));
                console.error(`Pending requests:`, rooms[room].joinRequests.map(r => r.user));
                socket.emit('error', { message: 'You are not authorized to join this room. Please request access first.' });
                return;
            }
        }
        
        // ALWAYS add/update current socket to room
        rooms[room].users[socket.id] = user;
        socketToRoom[socket.id] = room;
        console.log(`User ${user} mapped to socket ${socket.id} in room ${room}`);

        // CRITICAL: Join the socket room
        socket.join(room);
        
        // Verify socket is in room
        const roomSockets = Array.from(io.sockets.adapter.rooms.get(room) || []);
        const isInRoom = roomSockets.includes(socket.id);
        
        console.log(`${user} joined room: ${room} (socket: ${socket.id})`);
        console.log(`Room users:`, rooms[room].users);
        console.log(`Socket rooms (${roomSockets.length} sockets):`, roomSockets);
        console.log(`Socket ${socket.id} is in room: ${isInRoom}`);
        
        if (!isInRoom) {
            console.error(`WARNING: Socket ${socket.id} failed to join room ${room}`);
            // Try again
            socket.join(room);
        }

        // Send room users list (excluding current user)
        const roomUsers = Object.values(rooms[room].users).filter(u => u !== user);
        socket.emit('roomUsers', roomUsers);
        console.log(`Sent ${roomUsers.length} users to ${user}:`, roomUsers);

        // Notify others in the room about new user (only if not first connection)
        if (userSocketId !== socket.id) {
            socket.to(room).emit('userJoinedRoom', {
                user: user,
                room: room,
                timestamp: new Date().toISOString()
            });
        }

        // Send updated room users list to all (excluding the joining user)
        const updatedRoomUsers = Object.values(rooms[room].users);
        socket.to(room).emit('roomUsersUpdate', updatedRoomUsers.filter(u => u !== user));
        socket.emit('roomUsersUpdate', updatedRoomUsers.filter(u => u !== user));
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
        // Use the socket.id from the current socket, not the passed id
        const room = socketToRoom[socket.id];
        console.log(`Message from socket ${socket.id}, room: ${room}, message: ${message}`);
        console.log(`socketToRoom mapping:`, socketToRoom);
        console.log(`rooms[${room}] users:`, room ? rooms[room]?.users : 'N/A');
        
        if (room && rooms[room] && rooms[room].users[socket.id] && message){
            const user = rooms[room].users[socket.id];
            const roomSockets = Array.from(io.sockets.adapter.rooms.get(room) || []);
            console.log(`Broadcasting message from ${user} to room ${room} (${roomSockets.length} sockets)`);
            console.log(`Sockets in room:`, roomSockets);
            
            // CRITICAL: Broadcast to ALL users in the room (including sender)
            io.to(room).emit('sendMessage', {
                user: user,
                message: message,
                id: socket.id,
                timestamp: new Date().toISOString()
            });
            
            console.log(`Message broadcasted successfully`);
        } else {
            console.error(`Message failed - room: ${room}, user in room: ${room ? rooms[room]?.users[socket.id] : 'N/A'}, message: ${message}`);
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
            
            // CRITICAL: Never delete MAIN_ROOM, always keep it alive
            if (room === MAIN_ROOM) {
                // For main room, just remove user but keep room
                // Notify others in the room
                socket.to(room).emit('userLeftRoom', {
                    user: leavingUser,
                    room: room,
                    timestamp: new Date().toISOString()
                });

                // Send updated room users list
                const updatedRoomUsers = Object.values(rooms[room].users);
                io.to(room).emit('roomUsersUpdate', updatedRoomUsers);
                
                // If owner left, assign new owner (first remaining user)
                if (isOwner && Object.keys(rooms[room].users).length > 0) {
                    const newOwner = Object.values(rooms[room].users)[0];
                    rooms[room].owner = newOwner;
                    console.log(`New owner for ${room}: ${newOwner}`);
                }
                
                console.log(`${leavingUser} left ${room} (main room - kept alive)`);
            } else {
                // For other rooms, delete if owner leaves
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
