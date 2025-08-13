import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client"
import ReactScrollToBottom  from "react-scroll-to-bottom";
import { Send } from 'lucide-react';
import Message from "./Message.jsx";
import close  from "../images/close.png"

let socket;
const ENDPOINT = "https://chatverse-backend-1041.onrender.com";
const Chat = () => {
    const [id , setid] = useState("");
    const [messages,setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const user = sessionStorage.getItem("user") || "Anonymous"; 
    const send =()=>{
        const message = messageInput;
        if(message.trim()){
        socket.emit('message',{user,message,id});
        setMessageInput("");
        }
    }
    console.log(messages);
    useEffect (()=>{

        socket = socketIO(ENDPOINT ,{transports :['websocket']});

        socket.on('connect',()=>{
            //alert("Connected");
            console.log(`Client connected!`);
            setid(socket.id);
        });

        socket.emit('joined',{user});

        socket.on('welcome',(data)=>{
            setMessages((prevMessages) => [...prevMessages, data]);
            console.log(data.user , data.message);
        })
        
        socket.on('userJoined',(data)=>{
            setMessages((prevMessages) => [...prevMessages, data]);
            console.log(data.user,data.message);
        });

        socket.on('leave', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            console.log(`${data.user}: ${data.message}`); // Example: "Admin: User has left"
        });
        return ()=>{
             //socket.emit('disconnect');
             socket.off();
        }

    },[]);

    useEffect(() => {
            socket.on('sendMessage', (data) => {
                setMessages((prevMessages) => [...prevMessages, data]);
                console.log(data.user, data.message, data.id);
            })
            return () => {
                socket.off();
            }   //todo
        }, []);
    return (
        <div className="chatPage bg-[rgb(41,40,40)] h-screen w-screen flex justify-center items-center">
        <div className="chatContainer max-md:w-[100%] max-md:h-[100%] bg-white h-[65%] w-[50%] box-border">
        <div className="header max-md:h-[10%] bg-[#518BE1] max-md:text-2xl  h-[15%] flex items-center justify-between ">
        <h2 className="m-[1.5vmax] text-4xl max-md:text-[7vw]">ChatVerse</h2>
               <a href="/"> <img src={close} className="m-[1.5vmax] transition-all duration-300 cursor-pointer hover:scale-120" alt="close"></img> </a>
            </div>
            <ReactScrollToBottom className="chatBox max-md:h-[80%]  h-[70%] box-border overflow-y-auto flex flex-col items-start">
                {messages.map((item,i)=>(
                    <Message key={i}  user={item.user} message={item.message} classs={item.id===id ? 'right':'left'}/>   
                ))}
            </ReactScrollToBottom>
            <div className="inputBox flex border-t  border-black h-[15%] box-border max-md:h-[10%]">
                <input type="text" id="chatInput" className="w-[80%] border-t  bg-white  focus:ring-0 focus:outline-none  p-[2vmax] box-border text-xl" onKeyDown={(e) => e.key === "Enter" && send()}  value={messageInput}
                onChange={(e)=>(setMessageInput(e.target.value))}></input>
                <button className="sendBtn w-[20%] text-white bg-[#518BE1] hover:bg-blue-500 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 py-2 text-2xl" onClick={send}  
                ><Send className="w-9 h-9 transition-all duration-300 hover:scale-120"/></button>
            </div>
        </div>
       </div>
    );
};

export default Chat;
