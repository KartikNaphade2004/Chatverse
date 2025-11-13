import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, ArrowRight, RefreshCw, Plus, Search, TrendingUp, Hash, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [socket, setSocket] = useState(null);
    const [username, setUsername] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState('users');
    const navigate = useNavigate();

    useEffect(() => {
        const user = sessionStorage.getItem("user");
        if (!user) {
            navigate('/');
            return;
        }
        setUsername(user);

        const newSocket = socketIO(ENDPOINT, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 500
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

    useEffect(() => {
        let sorted = [...rooms];

        if (sortBy === 'users') {
            sorted.sort((a, b) => (b.userCount || 0) - (a.userCount || 0));
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'recent') {
            sorted = sorted.reverse();
        }

        if (searchQuery.trim()) {
            sorted = sorted.filter(room => 
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.owner.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredRooms(sorted);
    }, [rooms, sortBy, searchQuery]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('roomSearch')?.focus();
            } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCreateRoom();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const handleEnterRoom = (roomName, isOwner) => {
        if (!username) {
            navigate('/');
            return;
        }

        sessionStorage.setItem("room", roomName);
        sessionStorage.setItem("isRoomOwner", isOwner ? "true" : "false");

        if (isOwner) {
            navigate('/requests');
        } else {
            const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');
            const hasAccess = acceptedRequests.some(r => 
                (r.from === username || r.to === username) && r.room === roomName
            );

            if (hasAccess) {
                navigate('/chat');
            } else {
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

    const isRoomOwner = (room) => {
        return room.owner === username;
    };

    const hasRoomAccess = (roomName) => {
        const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');
        return acceptedRequests.some(r => 
            (r.from === username || r.to === username) && r.room === roomName
        );
    };

    return (
        <div className="roomListPage relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen w-screen flex flex-col items-center p-4 md:p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2RjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

            <div className="relative z-10 w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-gray-800 text-3xl md:text-4xl font-extrabold mb-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Active Rooms
                            </h1>
                            <p className="text-gray-600 font-medium">Browse and join chat rooms</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2.5 bg-white hover:bg-gray-50 rounded-xl text-gray-700 transition-all flex items-center gap-2 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                                title="Refresh (R)"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all hover:scale-105 hover:shadow-xl flex items-center gap-2 shadow-lg"
                                title="Create Room (Ctrl+N)"
                            >
                                <Plus className="w-4 h-4" />
                                Create Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="roomSearch"
                                type="text"
                                placeholder="Search rooms by name or owner... (Press / to focus)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white text-gray-800 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all appearance-none cursor-pointer pr-10 shadow-sm"
                            >
                                <option value="users">Most Users</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="recent">Most Recent</option>
                            </select>
                            <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Rooms Grid */}
                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room, index) => {
                            const isOwner = isRoomOwner(room);
                            const hasAccess = hasRoomAccess(room.name);
                            
                            return (
                                <div
                                    key={room.name}
                                    className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:scale-105 animate-fade-in cursor-pointer"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    onClick={() => handleEnterRoom(room.name, isOwner)}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                                                <Hash className="w-7 h-7" />
                                            </div>
                                            {isOwner && (
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                    <span className="text-xs">👑</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-gray-800 font-bold text-xl mb-1 truncate">{room.name}</h3>
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                <span className="font-semibold">{room.userCount || 0}</span>
                                                <span>user{room.userCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4 space-y-2">
                                        <div className="text-gray-600 text-sm">
                                            <span className="text-gray-400">Owner:</span> <span className="font-semibold text-gray-700">{room.owner}</span>
                                        </div>
                                        {isOwner && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs font-semibold">
                                                <Sparkles className="w-3 h-3" />
                                                Your Room
                                            </div>
                                        )}
                                        {hasAccess && !isOwner && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-green-700 text-xs font-semibold">
                                                ✓ Joined
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEnterRoom(room.name, isOwner);
                                        }}
                                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 ${
                                            isOwner
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
                                                : hasAccess
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                                        }`}
                                    >
                                        {isOwner ? (
                                            <>
                                                <MessageCircle className="w-4 h-4" />
                                                Manage Room
                                            </>
                                        ) : hasAccess ? (
                                            <>
                                                <ArrowRight className="w-4 h-4" />
                                                Enter Room
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="w-4 h-4" />
                                                Request to Join
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-white/50 shadow-xl text-center">
                        <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-800 text-xl font-semibold mb-2">
                            {searchQuery ? 'No rooms found' : 'No active rooms'}
                        </p>
                        <p className="text-gray-600 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Be the first to create a room!'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleCreateRoom}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                            >
                                <Zap className="w-5 h-5" />
                                Create Your First Room
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                {rooms.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                        <div className="flex items-center justify-center gap-8 text-center">
                            <div>
                                <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{rooms.length}</p>
                                <p className="text-sm text-gray-600 font-medium">Total Rooms</p>
                            </div>
                            <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                            <div>
                                <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {rooms.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                                </p>
                                <p className="text-sm text-gray-600 font-medium">Total Users</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Made by Credit */}
                <div className="text-center pb-4">
                    <p className="text-gray-500 text-sm">
                        Made with <span className="text-red-500">❤️</span> by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoomList;
