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
        <div className="roomListPage space-scene relative min-h-screen w-screen flex flex-col items-center p-6 md:p-12 text-white overflow-hidden">
            <div className="among-overlay"></div>

            <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Header */}
                <div className="crew-card p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-3">
                            <span className="crew-tag">Galaxy Lobby</span>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                Active Starship Channels
                            </h1>
                            <p className="text-[var(--sus-text-secondary)] max-w-xl leading-relaxed">
                                Browse open comm-links, ping crewmates, or spin up your own secret mission room. Every channel is a different sector—choose wisely, captain.
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <button
                                onClick={handleRefresh}
                                className="crew-visor w-full md:w-auto justify-center gap-2"
                                title="Refresh (R)"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Sync Rooms
                            </button>
                            <button
                                onClick={handleCreateRoom}
                                className="sus-button w-full md:w-auto px-6 py-3 flex items-center justify-center gap-3"
                                title="Create Room (Ctrl+N)"
                            >
                                <Plus className="w-4 h-4" />
                                New Mission Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="among-card p-5 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[rgba(199,208,255,0.6)] w-5 h-5" />
                            <input
                                id="roomSearch"
                                type="text"
                                placeholder="Scan channels by codename or captain... (Press / to focus)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="sus-input w-full pl-12 pr-4 py-3 rounded-2xl"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sus-input appearance-none pr-12 pl-5 py-3 rounded-2xl text-sm"
                            >
                                <option value="users">Most Crew On Board</option>
                                <option value="name">Codename (A-Z)</option>
                                <option value="recent">Freshly Created</option>
                            </select>
                            <TrendingUp className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[rgba(199,208,255,0.6)] w-5 h-5 pointer-events-none" />
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
                                    className="among-card p-6 rounded-3xl cursor-pointer group transition duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.45)] hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    onClick={() => handleEnterRoom(room.name, isOwner)}
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),rgba(123,92,255,0.35))] flex items-center justify-center shadow-[0_18px_45px_rgba(32,15,55,0.7)] group-hover:scale-110 transition-transform">
                                                <Hash className="w-7 h-7 text-white" />
                                            </div>
                                            {isOwner && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[linear-gradient(135deg,rgba(255,209,102,0.95),rgba(255,138,76,0.95))] rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.4)] shadow-[0_12px_25px_rgba(255,186,73,0.45)]">
                                                    <span className="text-sm">👑</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <h3 className="text-xl font-semibold truncate">{room.name}</h3>
                                            <div className="flex items-center gap-3 text-[var(--sus-text-secondary)] text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-[#7dd3fc]" />
                                                    <span className="font-semibold text-white">{room.userCount || 0}</span>
                                                    <span>onboard</span>
                                                </div>
                                                <span className="crew-tag text-[0.65rem] tracking-[0.28em] uppercase">
                                                    {room.owner}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-5 space-y-2 text-xs uppercase tracking-[0.2em]">
                                        {isOwner && (
                                            <div className="crew-tag inline-flex items-center gap-2 text-xs">
                                                <Sparkles className="w-3 h-3 text-[#ffd166]" />
                                                You command this ship
                                            </div>
                                        )}
                                        {hasAccess && !isOwner && (
                                            <div className="crew-tag inline-flex items-center gap-2 text-xs text-[#9ef6c6]">
                                                ✓ Boarding granted
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEnterRoom(room.name, isOwner);
                                        }}
                                        className={`w-full py-3 rounded-2xl font-semibold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-transform ${
                                            isOwner
                                                ? 'bg-[linear-gradient(135deg,#ffd166,#ff9d66)] text-[#1b0b27]'
                                                : hasAccess
                                                ? 'bg-[linear-gradient(135deg,#8df5c1,#3dd686)] text-[#0f172a]'
                                                : 'bg-[linear-gradient(135deg,#00c2ff,#7b5cff,#ff4d6d)] text-[#1b0b27]'
                                        }`}
                                    >
                                        {isOwner ? (
                                            <>
                                                <MessageCircle className="w-4 h-4" />
                                                Manage Deck
                                            </>
                                        ) : hasAccess ? (
                                            <>
                                                <ArrowRight className="w-4 h-4" />
                                                Enter Airlock
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="w-4 h-4" />
                                                Request Boarding
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="crew-card p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-5 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),rgba(0,194,255,0.25))] rounded-3xl flex items-center justify-center shadow-[0_18px_45px_rgba(11,25,52,0.6)]">
                            <MessageCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">
                            {searchQuery ? 'Sector clear — no matches' : 'No active starships yet'}
                        </h2>
                        <p className="text-[var(--sus-text-secondary)] max-w-lg mx-auto mb-6 leading-relaxed">
                            {searchQuery
                                ? 'Adjust your search parameters and scan the galaxy again.'
                                : 'Be first to launch a crew channel and start transmitting across the void.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleCreateRoom}
                                className="sus-button px-6 py-3 inline-flex items-center gap-3"
                            >
                                <Zap className="w-5 h-5" />
                                Launch First Channel
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                {rooms.length > 0 && (
                    <div className="among-card p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-center">
                            <div>
                                <p className="text-4xl font-black text-white">{rooms.length}</p>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--sus-text-secondary)] mt-2">
                                    Active Rooms
                                </p>
                            </div>
                            <div className="h-12 w-px bg-gradient-to-b from-transparent via-[rgba(255,255,255,0.2)] to-transparent"></div>
                            <div>
                                <p className="text-4xl font-black text-white">
                                    {rooms.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                                </p>
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--sus-text-secondary)] mt-2">
                                    Crewmates Online
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Made by Credit */}
                <div className="text-center pb-4 text-xs text-[var(--sus-text-secondary)] uppercase tracking-[0.2em]">
                    Made with ❤️ by <span className="text-white font-semibold tracking-[0.25em]">Kartik Naphade</span>
                </div>
            </div>
        </div>
    );
};

export default RoomList;
