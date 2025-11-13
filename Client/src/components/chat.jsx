import React, { useEffect, useState } from "react";
import socketIO from "socket.io-client"
import ReactScrollToBottom  from "react-scroll-to-bottom";
import { Send, Users, X, MessageCircle, ArrowLeft, Hash, Wifi, WifiOff } from 'lucide-react';
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
        <div className="chatPage space-scene relative h-screen w-screen flex text-white overflow-hidden">
            <div className="among-overlay"></div>

            {/* Sidebar */}
            <div className="w-72 bg-[rgba(6,11,35,0.92)] backdrop-blur-xl border-r border-[rgba(123,92,255,0.25)] flex flex-col flex-shrink-0 shadow-[0_20px_60px_rgba(5,8,25,0.8)] relative z-10">
                {/* Sidebar Header */}
                <div className="h-20 border-b border-[rgba(123,92,255,0.25)] px-5 flex items-center justify-between">
                    <button 
                        onClick={handleBackToRooms}
                        className="crew-visor text-xs gap-2"
                        title="Back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Lobby
                    </button>
                    <div className="text-right">
                        <p className="text-sm font-semibold truncate max-w-[150px]">{room}</p>
                        {isRoomOwner && (
                            <span className="text-[0.6rem] uppercase tracking-[0.25em] text-[#ffd166]">Captain</span>
                        )}
                    </div>
                </div>

                {/* Room Info */}
                <div className="p-5 border-b border-[rgba(123,92,255,0.25)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,rgba(0,194,255,0.35),rgba(123,92,255,0.35))] flex items-center justify-center">
                            <Hash className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-[var(--sus-text-secondary)]">Channel</p>
                            <p className="text-xs text-[var(--sus-text-secondary)]">Crew transmissions active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--sus-text-secondary)]">
                        {isConnected ? (
                            <>
                                <Wifi className="w-4 h-4 text-[#5eead4]" />
                                Linked
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-[#f87171]" />
                                Offline
                            </>
                        )}
                    </div>
                </div>

                {/* Crew List */}
                <div className="flex-1 overflow-y-auto p-5 dark-scrollbar">
                    <div className="uppercase text-xs tracking-[0.28em] text-[var(--sus-text-secondary)] mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#7dd3fc]" />
                        Crew — {onlineUsers.length + 1}
                    </div>
                    <div className="space-y-3">
                        <div className="among-card border border-[rgba(0,194,255,0.3)] bg-[rgba(4,7,20,0.85)] p-3 flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[linear-gradient(135deg,#ff4d6d,#7b5cff)] flex items-center justify-center text-white font-semibold">
                                {user.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{user}</p>
                                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#7dd3fc]">
                                    {isRoomOwner ? 'Captain' : 'Crewmate'}
                                </p>
                            </div>
                        </div>
                        {onlineUsers.map((onlineUser, index) => (
                            <div key={index} className="among-card bg-[rgba(6,11,35,0.72)] border border-[rgba(123,92,255,0.25)] p-3 flex items-center gap-3 animate-fade-in">
                                <div className="w-11 h-11 rounded-full bg-[linear-gradient(135deg,#3dd686,#00c2ff)] flex items-center justify-center text-[#061030] font-semibold">
                                    {onlineUser.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-sm font-medium truncate">{onlineUser}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[rgba(123,92,255,0.25)]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.28em] text-[var(--sus-text-secondary)]">Status</span>
                        <button
                            onClick={handleLeave}
                            className="crew-visor text-xs gap-2 bg-[rgba(255,77,109,0.2)] border border-[rgba(255,118,107,0.5)] text-[#ffccd8]"
                            title="Leave"
                        >
                            <X className="w-4 h-4" />
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10">
                {/* Header */}
                <div className="h-20 border-b border-[rgba(123,92,255,0.2)] px-6 flex items-center justify-between bg-[rgba(4,7,20,0.75)] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#00c2ff,#7b5cff)] flex items-center justify-center text-[#040714] font-extrabold shadow-[0_18px_45px_rgba(12,25,68,0.65)]">
                            <Hash className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{room}</h2>
                            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--sus-text-secondary)]">
                                Secure crew transmission
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
                        {isConnected ? (
                            <div className="crew-visor bg-[rgba(0,194,255,0.2)] border border-[rgba(0,194,255,0.35)] text-[#9fe9ff]">
                                <Wifi className="w-4 h-4" />
                                Link Stable
                            </div>
                        ) : (
                            <div className="crew-visor bg-[rgba(255,77,109,0.2)] border border-[rgba(255,118,107,0.4)] text-[#ffd6de]">
                                <WifiOff className="w-4 h-4" />
                                Reconnecting
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <ReactScrollToBottom className="flex-1 overflow-y-auto px-6 py-8 bg-[rgba(4,7,20,0.55)] backdrop-blur-xl">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[var(--sus-text-secondary)]">
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 mx-auto bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),rgba(0,194,255,0.25))] rounded-3xl flex items-center justify-center shadow-[0_20px_60px_rgba(7,14,38,0.65)]">
                                    <MessageCircle className="w-12 h-12 text-white" />
                                </div>
                                <p className="text-lg font-semibold text-white">Comms are clear</p>
                                <p className="text-sm">Open the channel with your first transmission.</p>
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

                {/* Input */}
                <div className="h-24 border-t border-[rgba(123,92,255,0.2)] bg-[rgba(4,7,20,0.82)] backdrop-blur-xl px-6 flex items-center">
                    <div className="w-full flex items-center gap-4">
                        <input 
                            type="text" 
                            id="chatInput" 
                            className="sus-input flex-1 rounded-2xl py-4 px-5 text-base"
                            placeholder={isConnected ? `Transmit to #${room}` : "Synchronizing..."}
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
                            className={`sus-button px-5 py-3 rounded-2xl flex items-center gap-3 ${
                                messageInput.trim() && isConnected ? '' : 'opacity-60 cursor-not-allowed'
                            }`}
                            onClick={send}
                            disabled={!messageInput.trim() || !isConnected}
                            title="Send Message"
                        >
                            <Send className="w-5 h-5" />
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Credit */}
            <div className="absolute bottom-6 right-6 z-20 text-xs text-[var(--sus-text-secondary)] uppercase tracking-[0.25em]">
                Crafted by <span className="text-white font-semibold tracking-[0.3em]">Kartik Naphade</span>
            </div>
        </div>
    );
};

export default Chat;
