import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [focused, setFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();
    const username = sessionStorage.getItem("user") || "";

    useEffect(() => {
        if (!username) {
            navigate('/');
            return;
        }
    }, [username, navigate]);

    const handleCreateRoom = () => {
        if (roomName.trim() && username) {
            setIsCreating(true);
            
            const socket = socketIO(ENDPOINT, { transports: ['websocket'] });
            
            socket.on('connect', () => {
                socket.emit('createRoom', { 
                    room: roomName.trim(), 
                    user: username 
                });
            });
            
            socket.on('roomCreated', () => {
                sessionStorage.setItem("room", roomName.trim());
                sessionStorage.setItem("isRoomOwner", "true");
                socket.disconnect();
                navigate('/requests');
            });
            
            socket.on('roomExists', () => {
                alert('Room already exists! Please choose a different name.');
                setIsCreating(false);
                socket.disconnect();
            });
        }
    };

    return (
        <div className="createRoomPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen w-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/rooms')}
                        className="mb-6 p-2 hover:bg-white/10 rounded-xl text-white transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                <Plus className="w-8 h-8" />
                            </div>
                        </div>
                        <h1 className="text-white text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Create Room
                        </h1>
                        <p className="text-purple-200 text-sm">Create your own chat room</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <div className="relative">
                            <label className="block text-white/80 text-sm font-medium mb-2">
                                Room Name
                            </label>
                            <input
                                type="text"
                                className={`w-full p-4 text-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 rounded-xl outline-none border-2 transition-all duration-300 ${
                                    focused
                                        ? 'border-purple-400 shadow-lg shadow-purple-500/50 scale-[1.02]' 
                                        : 'border-white/30 hover:border-white/50'
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
                            className="w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden"
                        >
                            {isCreating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Room
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Made by Credit */}
                    <div className="mt-8 text-center">
                        <p className="text-white/50 text-xs">
                            Made with ❤️ by <span className="text-purple-300 font-semibold">Kartik Naphade</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;

