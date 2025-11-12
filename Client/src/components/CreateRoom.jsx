import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [focused, setFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const socketRef = useRef(null);
    const navigate = useNavigate();
    const username = sessionStorage.getItem("user") || "";

    useEffect(() => {
        if (!username) {
            navigate('/');
            return;
        }
    }, [username, navigate]);

    const handleCreateRoom = () => {
        if (roomName.trim() && username && !isCreating) {
            setIsCreating(true);
            setError("");
            
            // Clean up any existing socket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            
            const socket = socketIO(ENDPOINT, { 
                transports: ['websocket'],
                timeout: 10000
            });
            
            socketRef.current = socket;
            
            const timeout = setTimeout(() => {
                if (socket.connected === false) {
                    setError('Connection timeout. Please try again.');
                    setIsCreating(false);
                    socket.disconnect();
                }
            }, 10000);
            
            socket.on('connect', () => {
                clearTimeout(timeout);
                socket.emit('createRoom', { 
                    room: roomName.trim(), 
                    user: username 
                });
            });
            
            socket.on('roomCreated', (data) => {
                clearTimeout(timeout);
                sessionStorage.setItem("room", roomName.trim());
                sessionStorage.setItem("isRoomOwner", "true");
                socket.disconnect();
                socketRef.current = null;
                navigate('/requests');
            });
            
            socket.on('roomExists', () => {
                clearTimeout(timeout);
                setError('Room already exists! Please choose a different name.');
                setIsCreating(false);
                socket.disconnect();
                socketRef.current = null;
            });

            socket.on('error', (error) => {
                clearTimeout(timeout);
                setError(error.message || 'An error occurred. Please try again.');
                setIsCreating(false);
                socket.disconnect();
                socketRef.current = null;
            });

            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                setError('Failed to connect to server. Please check your connection.');
                setIsCreating(false);
                socketRef.current = null;
            });
        }
    };

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div className="createRoomPage relative bg-gray-50 min-h-screen w-screen flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/rooms')}
                        className="mb-6 p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                <Plus className="w-8 h-8" />
                            </div>
                        </div>
                        <h1 className="text-gray-800 text-3xl md:text-4xl font-bold mb-2">
                            Create Room
                        </h1>
                        <p className="text-gray-500 text-sm">Create your own chat room</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="relative">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Room Name
                            </label>
                            <input
                                type="text"
                                className={`w-full p-4 text-lg bg-gray-50 text-gray-800 placeholder-gray-400 rounded-lg outline-none border-2 transition-all duration-300 ${
                                    focused
                                        ? 'border-blue-500 shadow-md' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                placeholder="Enter room name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && roomName.trim() && !isCreating) {
                                        handleCreateRoom();
                                    }
                                }}
                                disabled={isCreating}
                            />
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            disabled={!roomName.trim() || isCreating}
                            className="w-full p-4 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Create Room
                                </>
                            )}
                        </button>
                    </div>

                    {/* Made by Credit */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs">
                            Made with ❤️ by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
