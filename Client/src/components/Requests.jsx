import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users, MessageCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-01hn.onrender.com";

const Requests = () => {
    const [joinRequests, setJoinRequests] = useState([]);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();
    const currentUser = sessionStorage.getItem("user") || "Anonymous";
    const currentRoom = sessionStorage.getItem("room") || "";
    const isRoomOwner = sessionStorage.getItem("isRoomOwner") === "true";

    useEffect(() => {
        if (!currentRoom || !currentUser) {
            navigate('/');
            return;
        }

        const newSocket = socketIO(ENDPOINT, {
            transports: ['websocket'],
            reconnection: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            
            if (isRoomOwner) {
                newSocket.emit('getJoinRequests', { room: currentRoom });
            } else {
                newSocket.emit('getRoomUsers', { room: currentRoom });
            }
        });

        if (isRoomOwner) {
            newSocket.on('joinRequests', (requests) => {
                setJoinRequests(requests);
            });

            newSocket.on('newJoinRequest', (data) => {
                newSocket.emit('getJoinRequests', { room: currentRoom });
            });
        } else {
            newSocket.on('joinRequestAccepted', (data) => {
                setTimeout(() => {
                    navigate('/chat');
                }, 500);
            });

            newSocket.on('joinRequestRejected', (data) => {
                alert('Your join request was rejected.');
                navigate('/rooms');
            });
        }

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [currentRoom, currentUser, isRoomOwner, navigate]);

    const acceptRequest = (requestingUser, requestingSocketId) => {
        if (socket) {
            socket.emit('acceptJoinRequest', {
                room: currentRoom,
                requestingUser: requestingUser,
                requestingSocketId: requestingSocketId
            });
            
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
        }
    };

    const rejectRequest = (requestingUser) => {
        if (socket) {
            socket.emit('rejectJoinRequest', {
                room: currentRoom,
                requestingUser: requestingUser
            });
            
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
        }
    };

    const handleBackToRooms = () => {
        navigate('/rooms');
    };

    if (isRoomOwner) {
        return (
            <div className="requestsPage relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen w-screen flex flex-col items-center p-4 md:p-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2RjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                        <button
                            onClick={handleBackToRooms}
                            className="mb-4 p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-gray-800 text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Room: {currentRoom}
                        </h1>
                        <p className="text-gray-600 font-medium">Manage join requests for your room</p>
                    </div>

                    {joinRequests.length > 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                            <h2 className="text-gray-800 text-xl font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-500" />
                                Join Requests ({joinRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {joinRequests.map((request, index) => (
                                    <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 flex items-center justify-between border-2 border-gray-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {request.user.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-gray-800 font-bold text-lg">{request.user}</h3>
                                                <p className="text-gray-500 text-sm">Wants to join your room</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => acceptRequest(request.user, request.socketId)}
                                                className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white transition-all hover:scale-110 shadow-lg"
                                                title="Accept"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(request.user)}
                                                className="p-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl text-white transition-all hover:scale-110 shadow-lg"
                                                title="Reject"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-white/50 shadow-xl text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-10 h-10 text-blue-500" />
                            </div>
                            <p className="text-gray-800 text-xl font-semibold mb-2">No join requests</p>
                            <p className="text-gray-600">Waiting for users to request to join your room...</p>
                        </div>
                    )}

                    <div className="text-center pb-4">
                        <p className="text-gray-500 text-sm">
                            Made with <span className="text-red-500">❤️</span> by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="requestsPage relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen w-screen flex flex-col items-center p-4 md:p-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2RjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-white/50 shadow-xl text-center animate-fade-in">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
                            <MessageCircle className="w-10 h-10 text-blue-500" />
                        </div>
                        <p className="text-gray-800 text-xl font-semibold mb-2">Waiting for approval</p>
                        <p className="text-gray-600">Your request to join <span className="font-bold text-gray-800">{currentRoom}</span> has been sent</p>
                        <p className="text-gray-500 text-sm mt-2">Waiting for room owner to accept...</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default Requests;
