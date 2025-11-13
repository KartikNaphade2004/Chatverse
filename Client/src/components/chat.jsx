import React, { useEffect, useState } from "react";
import socketIO from "socket.io-client"
import ReactScrollToBottom  from "react-scroll-to-bottom";
import { Send, Users, X, MessageCircle, ArrowLeft, Hash, Wifi, WifiOff } from 'lucide-react';
import Message from "./Message.jsx";
import { useNavigate } from 'react-router-dom';

let socket;
const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-01hn.onrender.com";

const Chat = () => {
    const [id, setid] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const navigate = useNavigate();
    const user = sessionStorage.getItem("user") || "Anonymous";
    const room = "Main Chat Room"; // Always use main room
    const isRoomOwner = false; // Simplified - no room ownership

    useEffect(() => {
        if (!user) {
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
            console.log(`Client connected! Socket ID: ${socket.id}`);
            setid(socket.id);
            setIsConnected(true);
            
            // Small delay to ensure socket is fully connected
            setTimeout(() => {
                socket.emit('joinRoom', { user, room });
            }, 100);
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
            // Users list already excludes current user from backend
            setOnlineUsers(users || []);
        });

        socket.on('roomUsersUpdate', (users) => {
            // Users list already excludes current user from backend
            setOnlineUsers(users || []);
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
            console.log('Received message:', data);
            setMessages((prevMessages) => [...prevMessages, { 
                user: data.user, 
                message: data.message, 
                id: data.id,
                timestamp: data.timestamp || new Date().toISOString() 
            }]);
        });

        return () => {
            socket.off('sendMessage');
        };
    }, []);

    const send = () => {
        const message = messageInput.trim();
        if (message && socket && socket.connected) {
            console.log('Sending message:', message, 'socket.id:', socket.id);
            socket.emit('message', { user, message, id: socket.id });
            setMessageInput("");
        } else {
            console.error('Cannot send message - socket not connected or message empty');
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
        navigate("/request");
    };

    return (
        <div className="chatPage relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 h-screen w-screen flex overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            {/* Sidebar - Enhanced Design */}
            <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col flex-shrink-0 shadow-2xl">
                {/* Sidebar Header */}
                <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-4 shadow-lg">
                    <button 
                        onClick={handleBackToRooms}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 transition-all hover:scale-110"
                        title="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 ml-3">
                        <h2 className="text-white font-bold text-sm truncate">{room}</h2>
                        {isRoomOwner && (
                            <p className="text-yellow-400 text-xs font-semibold">👑 Room Owner</p>
                        )}
                    </div>
                </div>

                {/* Room Info */}
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-2 text-gray-300 mb-3">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold">Room Info</span>
                    </div>
                    <div className="text-gray-400 text-xs space-y-2">
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <Wifi className="w-4 h-4 text-green-400" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-400" />
                            )}
                            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Online Users - Enhanced */}
                <div className="flex-1 overflow-y-auto p-4 dark-scrollbar">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mb-4 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-blue-400" />
                        Online — {onlineUsers.length + 1}
                    </div>
                    <div className="space-y-2">
                        {/* Current User */}
                        <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700/50 transition-all bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-200 text-sm font-semibold truncate">{user}</p>
                                {isRoomOwner && (
                                    <p className="text-yellow-400 text-xs font-medium">Owner</p>
                                )}
                            </div>
                        </div>
                        {/* Other Users */}
                        {onlineUsers.map((onlineUser, index) => (
                            <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-700/50 transition-all animate-fade-in">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {onlineUser.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-gray-200 text-sm font-medium truncate">{onlineUser}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Info Footer */}
                <div className="p-3 bg-gray-900 border-t border-gray-700 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {user.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-200 text-sm font-semibold truncate">{user}</p>
                        </div>
                        <button
                            onClick={handleLeave}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                            title="Leave"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="h-16 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                            <Hash className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-gray-800 text-xl font-bold">{room}</h2>
                            {isRoomOwner && (
                                <span className="text-xs text-yellow-600 font-semibold">👑 Owner</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        {isConnected ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                <Wifi className="w-4 h-4 text-green-500" />
                                <span className="text-green-700 font-medium">Connected</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                                <WifiOff className="w-4 h-4 text-red-500" />
                                <span className="text-red-700 font-medium">Disconnected</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <ReactScrollToBottom className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-10 h-10 text-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-bold text-gray-600">No messages yet</p>
                                    <p className="text-sm text-gray-500">Start the conversation!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
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

                {/* Input Area */}
                <div className="h-20 bg-white border-t border-gray-200 flex items-center px-6 shadow-lg">
                    <div className="w-full flex items-center gap-4">
                        <input 
                            type="text" 
                            id="chatInput" 
                            className="flex-1 bg-gradient-to-r from-gray-50 to-white text-gray-800 focus:outline-none px-5 py-3.5 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 shadow-sm" 
                            placeholder={isConnected ? `Message #${room}` : "Connecting..."}
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
                            className={`p-3.5 rounded-xl transition-all flex items-center justify-center shadow-lg ${
                                messageInput.trim() && isConnected
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-110'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            onClick={send}
                            disabled={!messageInput.trim() || !isConnected}
                            title="Send Message"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Made by Credit - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-20">
                <p className="text-gray-500 text-xs bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
                    Made by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                </p>
            </div>
        </div>
    );
};

export default Chat;
