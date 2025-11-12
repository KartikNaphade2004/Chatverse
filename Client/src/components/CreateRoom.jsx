import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [focused, setFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const navigate = useNavigate();
    const username = sessionStorage.getItem("user") || "";
    const socketRef = useRef(null);
    const timeoutRef = useRef(null);
    const creatingRoomRef = useRef(null);

    useEffect(() => {
        if (!username) {
            navigate('/');
            return;
        }

        // Create socket connection
        const socket = socketIO(ENDPOINT, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current = socket;

        // Set up event listeners once
        const handleRoomCreated = (data) => {
            console.log('Room created event received:', data);
            const currentRoom = creatingRoomRef.current;
            if (currentRoom && data.room === currentRoom) {
                console.log('Room created successfully:', currentRoom);
                sessionStorage.setItem("room", currentRoom);
                sessionStorage.setItem("isRoomOwner", "true");
                setIsCreating(false);
                setStatus("");
                creatingRoomRef.current = null;
                
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                
                navigate('/requests');
            }
        };

        const handleRoomExists = (data) => {
            console.log('Room exists event received:', data);
            const currentRoom = creatingRoomRef.current;
            if (currentRoom) {
                setError('Room already exists! Please choose a different name.');
                setIsCreating(false);
                setStatus("");
                creatingRoomRef.current = null;
                
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            }
        };

        const handleError = (errorData) => {
            console.error('Socket error received:', errorData);
            const currentRoom = creatingRoomRef.current;
            if (currentRoom) {
                setError(errorData.message || 'An error occurred. Please try again.');
                setIsCreating(false);
                setStatus("");
                creatingRoomRef.current = null;
                
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            }
        };

        const handleConnect = () => {
            console.log('Socket connected:', socket.id);
            setStatus("");
            // If we're trying to create a room, emit it now
            if (creatingRoomRef.current && isCreating) {
                console.log('Socket connected, creating room:', creatingRoomRef.current);
                socket.emit('createRoom', {
                    room: creatingRoomRef.current,
                    user: username
                });
            }
        };

        const handleConnectError = (err) => {
            console.error('Connection error:', err);
            setError('Failed to connect to server. Please check your connection.');
            setIsCreating(false);
            setStatus("");
            creatingRoomRef.current = null;
        };

        socket.on('connect', handleConnect);
        socket.on('roomCreated', handleRoomCreated);
        socket.on('roomExists', handleRoomExists);
        socket.on('error', handleError);
        socket.on('connect_error', handleConnectError);

        return () => {
            if (socketRef.current) {
                socketRef.current.off('connect', handleConnect);
                socketRef.current.off('roomCreated', handleRoomCreated);
                socketRef.current.off('roomExists', handleRoomExists);
                socketRef.current.off('error', handleError);
                socketRef.current.off('connect_error', handleConnectError);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [username, navigate, isCreating]);

    const handleCreateRoom = () => {
        const trimmedRoomName = roomName.trim();
        if (trimmedRoomName && username && !isCreating) {
            setError("");
            setStatus("Creating room...");
            setIsCreating(true);
            creatingRoomRef.current = trimmedRoomName;

            const socket = socketRef.current;

            if (!socket) {
                setError('Socket not initialized. Please refresh the page.');
                setIsCreating(false);
                creatingRoomRef.current = null;
                return;
            }

            // Set timeout for room creation
            timeoutRef.current = setTimeout(() => {
                if (isCreating && creatingRoomRef.current) {
                    console.error('Room creation timeout');
                    setError('Room creation is taking too long. Please try again.');
                    setIsCreating(false);
                    setStatus("");
                    creatingRoomRef.current = null;
                }
            }, 10000);

            // If socket is connected, emit immediately
            if (socket.connected) {
                console.log('Socket connected, emitting createRoom:', trimmedRoomName);
                socket.emit('createRoom', {
                    room: trimmedRoomName,
                    user: username
                });
            } else {
                console.log('Socket not connected, waiting for connection...');
                setStatus("Connecting to server...");
                // The connect handler will emit when connected
            }
        }
    };

    return (
        <div className="createRoomPage relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen w-screen flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2RjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

            <div className="relative z-10 w-full max-w-md mx-auto animate-fade-in">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/rooms')}
                        className="mb-6 p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all"
                        disabled={isCreating}
                        title="Back to Rooms (Esc)"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur-2xl opacity-50 animate-pulse"></div>
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl relative z-10">
                                    <Plus className="w-10 h-10" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-gray-800 text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Create Room
                        </h1>
                        <p className="text-gray-600 font-medium">Create your own chat room instantly</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}
                        {status && (
                            <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                {status}
                            </div>
                        )}
                        <div className="relative">
                            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">
                                Room Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    autoFocus
                                    className={`w-full p-4 pl-5 text-lg bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 rounded-xl outline-none border-2 transition-all duration-300 shadow-sm ${
                                        focused
                                            ? 'border-blue-500 shadow-lg shadow-blue-500/30 scale-[1.01]' 
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    placeholder="Enter room name (e.g., MyRoom)"
                                    value={roomName}
                                    onChange={(e) => {
                                        setRoomName(e.target.value);
                                        setError("");
                                    }}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && roomName.trim() && !isCreating) {
                                            handleCreateRoom();
                                        } else if (e.key === 'Escape') {
                                            navigate('/rooms');
                                        }
                                    }}
                                    disabled={isCreating}
                                />
                                {focused && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl -z-10 blur-xl"></div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-1">Press Enter to create • Esc to go back</p>
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            disabled={!roomName.trim() || isCreating}
                            className="w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden group"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {status || "Creating..."}
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Create Room Instantly
                                </>
                            )}
                        </button>

                        {/* Quick Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold">
                                <Zap className="w-4 h-4" />
                                Quick Tips
                            </div>
                            <ul className="text-xs text-blue-600 space-y-1 ml-6 list-disc">
                                <li>Room names are case-sensitive</li>
                                <li>Use unique names to avoid conflicts</li>
                                <li>You'll be the room owner automatically</li>
                            </ul>
                        </div>
                    </div>

                    {/* Made by Credit */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs">
                            Made with <span className="text-red-500">❤️</span> by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
