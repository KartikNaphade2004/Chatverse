import React, { useEffect, useState } from "react";
import socketIO from "socket.io-client"
import ReactScrollToBottom  from "react-scroll-to-bottom";
import { Send, Users, Wifi, WifiOff, X, MessageCircle } from 'lucide-react';
import Message from "./Message.jsx";

let socket;
const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const Chat = () => {
    const [id, setid] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const user = sessionStorage.getItem("user") || "Anonymous"; 

    const send = () => {
        const message = messageInput.trim();
        if (message && socket) {
            socket.emit('message', { user, message, id });
            setMessageInput("");
        }
    }

    useEffect(() => {
        socket = socketIO(ENDPOINT, { 
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log(`Client connected!`);
            setid(socket.id);
            setIsConnected(true);
            socket.emit('joined', { user });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        socket.on('welcome', (data) => {
            setMessages((prevMessages) => [...prevMessages, { ...data, timestamp: new Date().toISOString() }]);
        });
        
        socket.on('userJoined', (data) => {
            setMessages((prevMessages) => [...prevMessages, { ...data, timestamp: new Date().toISOString() }]);
            setOnlineUsers(prev => prev + 1);
        });

        socket.on('leave', (data) => {
            setMessages((prevMessages) => [...prevMessages, { ...data, timestamp: new Date().toISOString() }]);
            setOnlineUsers(prev => Math.max(0, prev - 1));
        });

        socket.on('userCount', (count) => {
            setOnlineUsers(count);
        });

        return () => {
            if (socket) {
                socket.off();
                socket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('sendMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, { ...data, timestamp: new Date().toISOString() }]);
        });

        return () => {
            socket.off('sendMessage');
        };
    }, []);

    const handleLeave = () => {
        if (socket) {
            socket.disconnect();
        }
        sessionStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className="chatPage bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 h-screen w-screen flex justify-center items-center p-4">
            <div className="chatContainer max-md:w-full max-md:h-full bg-white h-[85%] w-[90%] max-w-6xl box-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="header bg-gradient-to-r from-blue-600 to-purple-600 h-[12%] min-h-[70px] flex items-center justify-between px-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white text-2xl md:text-3xl font-bold">ChatVerse</h2>
                            <div className="flex items-center gap-2 text-white text-xs md:text-sm">
                                {isConnected ? (
                                    <>
                                        <Wifi className="w-4 h-4 text-green-300" />
                                        <span className="text-green-300">Connected</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-4 h-4 text-red-300" />
                                        <span className="text-red-300">Disconnected</span>
                                    </>
                                )}
                                {onlineUsers > 0 && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <Users className="w-4 h-4" />
                                        <span>{onlineUsers} online</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleLeave}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 cursor-pointer"
                        title="Leave Chat"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Chat Box */}
                <ReactScrollToBottom className="chatBox h-[75%] box-border overflow-y-auto flex flex-col bg-gray-50 p-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No messages yet</p>
                                <p className="text-sm mt-2">Start the conversation!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((item, i) => (
                            <Message 
                                key={i} 
                                user={item.user} 
                                message={item.message} 
                                classs={item.id === id ? 'right' : 'left'}
                                timestamp={item.timestamp}
                            />
                        ))
                    )}
                </ReactScrollToBottom>

                {/* Input Box */}
                <div className="inputBox flex border-t-2 border-gray-200 h-[13%] min-h-[70px] box-border bg-white">
                    <input 
                        type="text" 
                        id="chatInput" 
                        className="w-[85%] bg-white focus:ring-0 focus:outline-none px-6 box-border text-lg border-none" 
                        placeholder="Type your message here..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        disabled={!isConnected}
                    />
                    <button 
                        className="sendBtn w-[15%] text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg" 
                        onClick={send}
                        disabled={!messageInput.trim() || !isConnected}
                        title="Send Message"
                    >
                        <Send className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="hidden md:inline text-sm font-semibold">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
