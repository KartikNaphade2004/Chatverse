import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const [requestedUsers, setRequestedUsers] = useState(new Set());
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();
    const currentUser = sessionStorage.getItem("user") || "Anonymous";
    const currentRoom = sessionStorage.getItem("room") || "";

    // Initialize socket and join room
    useEffect(() => {
        if (!currentRoom || !currentUser) {
            navigate('/');
            return;
        }

        const newSocket = socketIO(ENDPOINT, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            // Join the room
            newSocket.emit('joinRoom', { user: currentUser, room: currentRoom });
        });

        newSocket.on('roomUsers', (users) => {
            // Filter out current user
            const otherUsers = users.filter(u => u !== currentUser);
            setRoomUsers(otherUsers);
        });

        newSocket.on('roomUsersUpdate', (users) => {
            // Filter out current user
            const otherUsers = users.filter(u => u !== currentUser);
            setRoomUsers(otherUsers);
        });

        newSocket.on('userJoinedRoom', (data) => {
            console.log(`${data.user} joined room`);
            // Request updated user list
            newSocket.emit('getRoomUsers', { room: currentRoom });
        });

        newSocket.on('userLeftRoom', (data) => {
            console.log(`${data.user} left room`);
            // Request updated user list
            newSocket.emit('getRoomUsers', { room: currentRoom });
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        // Get room users
        newSocket.emit('getRoomUsers', { room: currentRoom });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [currentRoom, currentUser, navigate]);

    // Load requests from localStorage
    useEffect(() => {
        const savedRequests = JSON.parse(localStorage.getItem('chatRequests') || '[]');
        // Filter requests by room
        const roomRequests = savedRequests.filter(r => r.room === currentRoom && !r.accepted && !r.rejected);
        setRequests(roomRequests);
        
        // Get list of users we've already requested in this room
        const requested = roomRequests.filter(r => r.from === currentUser).map(r => r.to);
        setRequestedUsers(new Set(requested));
    }, [currentUser, currentRoom]);

    const sendRequest = (toUser) => {
        const newRequest = {
            id: Date.now(),
            from: currentUser,
            to: toUser,
            room: currentRoom,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        const allRequests = JSON.parse(localStorage.getItem('chatRequests') || '[]');
        allRequests.push(newRequest);
        localStorage.setItem('chatRequests', JSON.stringify(allRequests));
        
        setRequests(prev => [...prev, newRequest]);
        setRequestedUsers(prev => new Set([...prev, toUser]));
    };

    const acceptRequest = (requestId) => {
        const allRequests = JSON.parse(localStorage.getItem('chatRequests') || '[]');
        const acceptedRequests = JSON.parse(localStorage.getItem('acceptedRequests') || '[]');
        
        const request = allRequests.find(r => r.id === requestId);
        if (request) {
            request.accepted = true;
            acceptedRequests.push({
                ...request,
                acceptedAt: new Date().toISOString()
            });
            
            localStorage.setItem('chatRequests', JSON.stringify(allRequests));
            localStorage.setItem('acceptedRequests', JSON.stringify(acceptedRequests));
            
            setRequests(prev => prev.filter(r => r.id !== requestId));
            
            // Navigate to chat after accepting
            setTimeout(() => {
                navigate('/chat');
            }, 500);
        }
    };

    const rejectRequest = (requestId) => {
        const allRequests = JSON.parse(localStorage.getItem('chatRequests') || '[]');
        const request = allRequests.find(r => r.id === requestId);
        if (request) {
            request.rejected = true;
            localStorage.setItem('chatRequests', JSON.stringify(allRequests));
            setRequests(prev => prev.filter(r => r.id !== requestId));
        }
    };

    const pendingRequests = requests.filter(r => r.to === currentUser && r.status === 'pending' && r.room === currentRoom);
    const sentRequests = requests.filter(r => r.from === currentUser && r.status === 'pending' && r.room === currentRoom);
    
    // Available users = room users - requested users - sent requests - pending requests
    const availableUsers = roomUsers.filter(u => 
        u !== currentUser &&
        !requestedUsers.has(u) && 
        !sentRequests.some(r => r.to === u) &&
        !pendingRequests.some(r => r.from === u)
    );

    return (
        <div className="requestsPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen w-screen flex flex-col items-center p-4 md:p-8 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                        Chat Requests
                    </h1>
                    <p className="text-purple-200 text-lg">Room: <span className="font-semibold text-white">{currentRoom}</span></p>
                    <p className="text-purple-300 text-sm mt-1">Users in this room: {roomUsers.length + 1}</p>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                        <h2 className="text-white text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                            <UserPlus className="w-6 h-6" />
                            Pending Requests ({pendingRequests.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {request.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{request.from}</h3>
                                            <p className="text-purple-200 text-sm">Wants to chat with you</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => acceptRequest(request.id)}
                                            className="p-3 bg-green-500 hover:bg-green-600 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg"
                                            title="Accept"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(request.id)}
                                            className="p-3 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg"
                                            title="Reject"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sent Requests */}
                {sentRequests.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                        <h2 className="text-white text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6" />
                            Sent Requests ({sentRequests.length})
                        </h2>
                        <div className="space-y-3">
                            {sentRequests.map((request) => (
                                <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                            {request.to.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{request.to}</h3>
                                            <p className="text-purple-200 text-sm">Waiting for acceptance...</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-yellow-500/20 rounded-xl text-yellow-200 text-sm font-medium">
                                        Pending
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Users in Room */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                    <h2 className="text-white text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Users in Room ({availableUsers.length})
                    </h2>
                    {availableUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableUsers.map((user) => (
                                <div key={user} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/20 hover:bg-white/20 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg relative">
                                            {user.charAt(0).toUpperCase()}
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{user}</h3>
                                            <p className="text-purple-200 text-sm">Online in room</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => sendRequest(user)}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-110 shadow-lg"
                                    >
                                        Send Request
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-purple-200">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No other users in this room at the moment</p>
                            <p className="text-sm mt-2 text-purple-300">Wait for others to join or try a different room</p>
                        </div>
                    )}
                </div>

                {/* No Requests Message */}
                {pendingRequests.length === 0 && sentRequests.length === 0 && availableUsers.length === 0 && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-300 opacity-50" />
                        <p className="text-white text-xl font-semibold mb-2">No users in room</p>
                        <p className="text-purple-200">Wait for others to join room: <span className="font-semibold text-white">{currentRoom}</span></p>
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

export default Requests;
