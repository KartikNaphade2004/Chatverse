import React, { useEffect, useState } from "react";
import socketIO from "socket.io-client"
import ReactScrollToBottom  from "react-scroll-to-bottom";
import { Send, Users, X, MessageCircle, ArrowLeft, Hash } from 'lucide-react';
import Message from "./Message.jsx";
import { useNavigate } from 'react-router-dom';

let socket;
const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const Chat = () => {
    const [id, setid] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
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
            setOnlineUsers(users);
        });

        socket.on('roomUsersUpdate', (users) => {
            setOnlineUsers(users.filter(u => u !== user));
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
        <div className="chatPage relative bg-gray-100 h-screen w-screen flex overflow-hidden">
            {/* Sidebar - Discord/Slack style */}
            <div className="w-64 bg-gray-800 flex flex-col flex-shrink-0">
                {/* Sidebar Header */}
                <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-4">
                    <button 
                        onClick={handleBackToRooms}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-300 transition-all"
                        title="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 ml-3">
                        <h2 className="text-white font-semibold text-sm truncate">{room}</h2>
                        {isRoomOwner && (
                            <p className="text-gray-400 text-xs">Room Owner</p>
                        )}
                    </div>
                </div>

                {/* Room Info */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm font-medium">Room Info</span>
                    </div>
                    <div className="text-gray-400 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                </div>

                {/* Online Users - Discord/Slack style */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
                        <Users className="w-4 h-4" />
                        Online — {onlineUsers.length + 1}
                    </div>
                    <div className="space-y-1">
                        {/* Current User */}
                        <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                {user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-200 text-sm font-medium truncate">{user}</p>
                                {isRoomOwner && (
                                    <p className="text-yellow-400 text-xs">Owner</p>
                                )}
                            </div>
                        </div>
                        {/* Other Users */}
                        {onlineUsers.map((onlineUser, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {onlineUser.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-gray-200 text-sm font-medium truncate">{onlineUser}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Info Footer */}
                <div className="p-3 bg-gray-900 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-200 text-sm font-medium truncate">{user}</p>
                        </div>
                        <button
                            onClick={handleLeave}
                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 transition-all"
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
                <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Hash className="w-6 h-6 text-gray-400" />
                        <h2 className="text-gray-800 text-xl font-semibold">{room}</h2>
                        {isRoomOwner && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Owner</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>

                {/* Messages Area */}
                <ReactScrollToBottom className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center space-y-4">
                                <MessageCircle className="w-16 h-16 mx-auto opacity-30" />
                                <div className="space-y-2">
                                    <p className="text-xl font-semibold text-gray-500">No messages yet</p>
                                    <p className="text-sm text-gray-400">Start the conversation!</p>
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
                <div className="h-20 bg-white border-t border-gray-200 flex items-center px-6">
                    <div className="w-full flex items-center gap-4">
                        <input 
                            type="text" 
                            id="chatInput" 
                            className="flex-1 bg-gray-50 text-gray-800 focus:outline-none px-4 py-3 text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400" 
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
                            className={`p-3 rounded-lg transition-all flex items-center justify-center ${
                                messageInput.trim() && isConnected
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
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
                <p className="text-gray-400 text-xs bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                    Made by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                </p>
            </div>
        </div>
    );
};

export default Chat;
