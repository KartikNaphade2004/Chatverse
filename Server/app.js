import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from "socket.io";
import cors from 'cors'
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors({
    origin:"http://localhost:5173/",
    credentials:true
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


