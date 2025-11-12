import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = sessionStorage.getItem("user");
        if (!user) {
            navigate('/');
            return;
        }
        setUsername(user);

        const newSocket = socketIO(ENDPOINT, {
            transports: ['websocket'],
            reconnection: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            // Get list of active rooms
            newSocket.emit('getActiveRooms');
        });

        newSocket.on('activeRooms', (roomList) => {
            setRooms(roomList);
        });

        newSocket.on('roomCreated', (data) => {
            // Refresh room list when a new room is created
            newSocket.emit('getActiveRooms');
        });

        newSocket.on('roomDeleted', () => {
            // Refresh room list when a room is deleted
            newSocket.emit('getActiveRooms');
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [navigate]);

    const handleRequestJoin = (roomName) => {
        if (!username) {
            navigate('/');
            return;
        }

        // Store room info
        sessionStorage.setItem("room", roomName);
        sessionStorage.setItem("isRoomOwner", "false");

        // Send join request
        if (socket) {
            socket.emit('requestJoinRoom', {
                room: roomName,
                user: username
            });

            socket.once('joinRequestSent', () => {
                // Navigate to requests page to see status
                navigate('/requests');
            });
        }
    };

    const handleRefresh = () => {
        if (socket) {
            socket.emit('getActiveRooms');
        }
    };

    const handleCreateNewRoom = () => {
        navigate('/');
    };

    return (
        <div className="roomListPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen w-screen flex flex-col items-center p-4 md:p-8 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative z-10 w-full max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Active Rooms
                    </h1>
                    <p className="text-purple-200 text-lg">Join a room or create your own</p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-300 flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={handleCreateNewRoom}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 flex items-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Create Room
                        </button>
                    </div>
                </div>

                {/* Rooms List */}
                {rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map((room) => (
                            <div
                                key={room.name}
                                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                        {room.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold text-xl">{room.name}</h3>
                                        <div className="flex items-center gap-2 text-purple-200 text-sm mt-1">
                                            <Users className="w-4 h-4" />
                                            <span>{room.userCount || 0} user{room.userCount !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-purple-300 text-sm mb-4">
                                    <span>Owner: {room.owner}</span>
                                </div>
                                <button
                                    onClick={() => handleRequestJoin(room.name)}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                                >
                                    Request to Join
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-300 opacity-50" />
                        <p className="text-white text-xl font-semibold mb-2">No active rooms</p>
                        <p className="text-purple-200 mb-6">Be the first to create a room!</p>
                        <button
                            onClick={handleCreateNewRoom}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            Create Your First Room
                        </button>
                    </div>
                )}

                {/* Made by Credit */}
                <div className="text-center mt-8 pb-4">
                    <p className="text-white/50 text-sm">
                        Made with ❤️ by <span className="text-purple-300 font-semibold">Kartik Naphade</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoomList;

