import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, ArrowRight, RefreshCw, Plus, Search, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState('users'); // 'users', 'name', 'recent'
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
            newSocket.emit('getActiveRooms');
        });

        newSocket.on('activeRooms', (roomList) => {
            setRooms(roomList);
            setFilteredRooms(roomList);
        });

        newSocket.on('roomCreated', () => {
            newSocket.emit('getActiveRooms');
        });

        newSocket.on('roomDeleted', () => {
            newSocket.emit('getActiveRooms');
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [navigate]);

    // Sort and filter rooms
    useEffect(() => {
        let sorted = [...rooms];

        // Apply sorting
        if (sortBy === 'users') {
            sorted.sort((a, b) => (b.userCount || 0) - (a.userCount || 0));
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'recent') {
            // For recent, we'll keep original order (newest first based on server)
            sorted = sorted.reverse();
        }

        // Apply search filter
        if (searchQuery.trim()) {
            sorted = sorted.filter(room => 
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.owner.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredRooms(sorted);
    }, [rooms, sortBy, searchQuery]);

    const handleEnterRoom = (roomName, isOwner) => {
        if (!username) {
            navigate('/');
            return;
        }

        sessionStorage.setItem("room", roomName);
        sessionStorage.setItem("isRoomOwner", isOwner ? "true" : "false");

        if (isOwner) {
            // Owner can directly enter
            navigate('/requests');
        } else {
            // Check if user has been accepted
            const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');
            const hasAccess = acceptedRequests.some(r => 
                (r.from === username || r.to === username) && r.room === roomName
            );

            if (hasAccess) {
                navigate('/chat');
            } else {
                // Send join request
                if (socket) {
                    socket.emit('requestJoinRoom', {
                        room: roomName,
                        user: username
                    });

                    socket.once('joinRequestSent', () => {
                        navigate('/requests');
                    });
                }
            }
        }
    };

    const handleCreateRoom = () => {
        navigate('/create-room');
    };

    const handleRefresh = () => {
        if (socket) {
            socket.emit('getActiveRooms');
        }
    };

    // Check if user owns a room
    const isRoomOwner = (room) => {
        return room.owner === username;
    };

    // Check if user has access to a room
    const hasRoomAccess = (roomName) => {
        const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');
        return acceptedRequests.some(r => 
            (r.from === username || r.to === username) && r.room === roomName
        );
    };

    return (
        <div className="roomListPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen w-screen flex flex-col items-center p-4 md:p-8 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative z-10 w-full max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Active Rooms
                    </h1>
                    <p className="text-purple-200 text-lg">Browse and join chat rooms</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search rooms by name or owner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                            >
                                <option value="users" className="bg-gray-800">Most Users</option>
                                <option value="name" className="bg-gray-800">Name (A-Z)</option>
                                <option value="recent" className="bg-gray-800">Most Recent</option>
                            </select>
                            <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-300 flex items-center gap-2 border border-white/20"
                                title="Refresh"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden md:inline">Create Room</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rooms Grid */}
                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room) => {
                            const isOwner = isRoomOwner(room);
                            const hasAccess = hasRoomAccess(room.name);
                            
                            return (
                                <div
                                    key={room.name}
                                    className="group bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/20"
                                >
                                    {/* Room Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {room.name.charAt(0).toUpperCase()}
                                            </div>
                                            {isOwner && (
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                                                    <span className="text-xs font-bold text-gray-900">👑</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-xl mb-1 truncate">{room.name}</h3>
                                            <div className="flex items-center gap-2 text-purple-200 text-sm">
                                                <Users className="w-4 h-4 flex-shrink-0" />
                                                <span className="font-semibold">{room.userCount || 0}</span>
                                                <span>user{room.userCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Room Info */}
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center gap-2 text-purple-300 text-sm">
                                            <span className="text-white/60">Owner:</span>
                                            <span className="font-semibold">{room.owner}</span>
                                        </div>
                                        {isOwner && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-xs font-medium">
                                                <span>Your Room</span>
                                            </div>
                                        )}
                                        {hasAccess && !isOwner && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-xs font-medium">
                                                <span>✓ Joined</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleEnterRoom(room.name, isOwner)}
                                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                                            isOwner
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                                                : hasAccess
                                                ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                                        }`}
                                    >
                                        {isOwner ? (
                                            <>
                                                <MessageCircle className="w-5 h-5" />
                                                Manage Room
                                            </>
                                        ) : hasAccess ? (
                                            <>
                                                <ArrowRight className="w-5 h-5" />
                                                Enter Room
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="w-5 h-5" />
                                                Request to Join
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                        <MessageCircle className="w-20 h-20 mx-auto mb-4 text-purple-300 opacity-50" />
                        <p className="text-white text-xl font-semibold mb-2">
                            {searchQuery ? 'No rooms found' : 'No active rooms'}
                        </p>
                        <p className="text-purple-200 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Be the first to create a room!'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleCreateRoom}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                                Create Your First Room
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                {rooms.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                        <div className="flex items-center justify-center gap-6 text-center">
                            <div>
                                <p className="text-2xl font-bold text-white">{rooms.length}</p>
                                <p className="text-sm text-purple-200">Total Rooms</p>
                            </div>
                            <div className="h-12 w-px bg-white/20"></div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {rooms.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                                </p>
                                <p className="text-sm text-purple-200">Total Users</p>
                            </div>
                        </div>
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
