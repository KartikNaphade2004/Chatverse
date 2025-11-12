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
const users=[{}];

io.on("connection",(socket)=>{
    console.log(`New connection.`);

    socket.on('joined',({user})=>{
        users[socket.id] = user;
        console.log(`${user} has joined`);  
        socket.broadcast.emit('userJoined',{user:"Admin",message:`${users[socket.id]} has joined `}); 
        socket.emit('welcome',{user:"Admin",message:`Welcome to the chat ${users[socket.id]}`});
    });

    socket.on('message',({message,id})=>{
            io.emit('sendMessage',{user : users[id],message,id});
    })

    socket.on('disconnect',()=>{
        socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]} User has left`});
        //console.log(`User :${ users[socket.id]} has left`);
    });

    socket.on('leave',(data)=>{
        console.log(data.user,data.message);
    });
   
});

app.get("/",(req,res)=>{
    res.send(`server working`);
});
server.listen(port,async()=>{
    
    console.log(`Server is running on port${port}`);
});


