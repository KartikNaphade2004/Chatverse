import React, { useEffect, useState } from "react";
import socketIO from "socket.io-client"
import ReactScrollToBottom  from "react-scroll-to-bottom";
import { Send, Users, X, MessageCircle, ArrowLeft } from 'lucide-react';
import Message from "./Message.jsx";
import { useNavigate } from 'react-router-dom';

let socket;
const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const Chat = () => {
    const [id, setid] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const navigate = useNavigate();
    const user = sessionStorage.getItem("user") || "Anonymous";
    const room = sessionStorage.getItem("room") || "";
    const isRoomOwner = sessionStorage.getItem("isRoomOwner") === "true";

    useEffect(() => {
        if (!room || !user) {
            navigate('/');
            return;
        }

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
            // Join the room
            socket.emit('joinRoom', { user, room });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            if (error.message && error.message.includes('authorized')) {
                navigate('/requests');
            }
        });

        socket.on('roomUsers', (users) => {
            // This is for initial load
        });

        socket.on('roomUsersUpdate', (users) => {
            setOnlineUsers(users.length);
        });

        socket.on('userJoinedRoom', (data) => {
            setMessages((prevMessages) => [...prevMessages, {
                user: "Admin",
                message: `${data.user} joined the room`,
                timestamp: new Date().toISOString()
            }]);
        });

        socket.on('userLeftRoom', (data) => {
            setMessages((prevMessages) => [...prevMessages, {
                user: "Admin",
                message: `${data.user} left the room`,
                timestamp: new Date().toISOString()
            }]);
        });

        socket.on('roomDeleted', (data) => {
            alert('Room has been deleted by the owner.');
            sessionStorage.removeItem("room");
            sessionStorage.removeItem("isRoomOwner");
            navigate('/rooms');
        });

        return () => {
            if (socket) {
                socket.off();
                socket.disconnect();
            }
        };
    }, [room, user, navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.on('sendMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, { ...data, timestamp: new Date().toISOString() }]);
        });

        return () => {
            socket.off('sendMessage');
        };
    }, []);

    const send = () => {
        const message = messageInput.trim();
        if (message && socket) {
            socket.emit('message', { user, message, id });
            setMessageInput("");
        }
    }

    const handleLeave = () => {
        if (socket) {
            socket.disconnect();
        }
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("room");
        sessionStorage.removeItem("isRoomOwner");
        navigate("/");
    };

    const handleBackToRooms = () => {
        if (isRoomOwner) {
            navigate("/requests");
        } else {
            navigate("/rooms");
        }
    };

    return (
        <div className="chatPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 h-screen w-screen flex justify-center items-center p-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
            
            <div className="chatContainer relative z-10 max-md:w-full max-md:h-full bg-white/95 backdrop-blur-xl h-[90%] w-[95%] max-w-5xl box-border rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/30">
                {/* Header */}
                <div className="header relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-auto min-h-[80px] flex items-center justify-between px-6 md:px-8 py-4 shadow-xl flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50 opacity-50"></div>
                    <div className="relative z-10 flex items-center gap-4 w-full">
                        <button 
                            onClick={handleBackToRooms}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 cursor-pointer group"
                            title="Back"
                        >
                            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:-translate-x-1 transition-transform duration-300" />
                        </button>
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow-lg">ChatVerse</h2>
                            <div className="flex items-center gap-3 text-white/90 text-xs md:text-sm mt-1">
                                <div className={`flex items-center gap-1 ${isConnected ? 'text-green-200' : 'text-red-200'}`}>
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></div>
                                    <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                                </div>
                                <span className="text-white/40">•</span>
                                <span className="text-white/80">Room: {room}</span>
                                {isRoomOwner && (
                                    <>
                                        <span className="text-white/40">•</span>
                                        <span className="text-yellow-200 text-xs">Owner</span>
                                    </>
                                )}
                                {onlineUsers > 0 && (
                                    <>
                                        <span className="text-white/40">•</span>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{onlineUsers} online</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleLeave}
                            className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 cursor-pointer group"
                            title="Leave Chat"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Chat Box - Fixed padding to prevent message hiding */}
                <ReactScrollToBottom className="chatBox flex-1 min-h-0 overflow-y-auto flex flex-col bg-gradient-to-b from-gray-50 to-white pt-6 pb-6 px-4 md:px-6">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                    <MessageCircle className="w-20 h-20 md:w-24 md:h-24 mx-auto relative z-10 opacity-40" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl md:text-2xl font-semibold text-gray-500">No messages yet</p>
                                    <p className="text-sm md:text-base text-gray-400">Start the conversation!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {messages.map((item, i) => (
                                <div key={i} className="message-enter">
                                    <Message 
                                        user={item.user} 
                                        message={item.message} 
                                        classs={item.id === id ? 'right' : 'left'}
                                        timestamp={item.timestamp}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </ReactScrollToBottom>

                {/* Input Box - Fixed to bottom with proper padding */}
                <div className="inputBox relative flex border-t border-gray-200/50 h-auto min-h-[90px] box-border bg-white/80 backdrop-blur-sm flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
                    <div className="relative z-10 w-full flex items-center px-4 md:px-6 py-4 gap-3">
                        <input 
                            type="text" 
                            id="chatInput" 
                            className="flex-1 bg-white/60 backdrop-blur-sm focus:bg-white text-gray-800 focus:ring-0 focus:outline-none px-5 py-3.5 text-base md:text-lg rounded-2xl border-2 border-gray-200/50 focus:border-purple-400 transition-all duration-300 placeholder-gray-400 shadow-sm" 
                            placeholder={isConnected ? "Type your message..." : "Connecting..."}
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
                            className={`p-4 md:p-5 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg transform ${
                                messageInput.trim() && isConnected
                                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={send}
                            disabled={!messageInput.trim() || !isConnected}
                            title="Send Message"
                        >
                            <Send className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>

                {/* Made by Credit */}
                <div className="absolute bottom-2 right-4 z-20">
                    <p className="text-gray-400 text-xs">
                        Made by <span className="text-purple-500 font-semibold">Kartik Naphade</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Chat;
