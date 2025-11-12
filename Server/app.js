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
const port = process.env.PORT || 3000 ; 
const users = {};

io.on("connection",(socket)=>{
    console.log(`New connection: ${socket.id}`);

    socket.on('joined',({user})=>{
        users[socket.id] = user;
        console.log(`${user} has joined`);  
        
        // Send welcome message to new user
        socket.emit('welcome',{
            user:"Admin",
            message:`Welcome to ChatVerse, ${users[socket.id]}! Start chatting with others.`,
            timestamp: new Date().toISOString()
        }); 
        
        // Notify other users
        socket.broadcast.emit('userJoined',{
            user:"Admin",
            message:`${users[socket.id]} has joined the chat`,
            timestamp: new Date().toISOString()
        });
        
        // Send current user count to all clients
        const userCount = Object.keys(users).length;
        io.emit('userCount', userCount);
    });

    socket.on('message',({message,id})=>{
        if(users[id] && message){
            io.emit('sendMessage',{
                user: users[id],
                message: message,
                id: id,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('disconnect',()=>{
        const leavingUser = users[socket.id];
        if(leavingUser){
            delete users[socket.id];
            socket.broadcast.emit('leave',{
                user:"Admin",
                message:`${leavingUser} has left the chat`,
                timestamp: new Date().toISOString()
            });
            
            // Update user count
            const userCount = Object.keys(users).length;
            io.emit('userCount', userCount);
            
            console.log(`${leavingUser} has left`);
        }
    });

    socket.on('leave',(data)=>{
        console.log(data.user, data.message);
    });
   
});

app.get("/",(req,res)=>{
    res.send(`server working`);
});
server.listen(port,async()=>{
    
    console.log(`Server is running on port${port}`);
});


