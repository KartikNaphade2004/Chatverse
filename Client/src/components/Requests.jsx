import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

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
                // Room owner: get join requests
                newSocket.emit('getJoinRequests', { room: currentRoom });
            } else {
                // Regular user: check if request was accepted
                newSocket.emit('getRoomUsers', { room: currentRoom });
            }
        });

        // Room owner events
        if (isRoomOwner) {
            newSocket.on('joinRequests', (requests) => {
                setJoinRequests(requests);
            });

            newSocket.on('newJoinRequest', (data) => {
                // Refresh join requests
                newSocket.emit('getJoinRequests', { room: currentRoom });
            });
        } else {
            // Regular user events
            newSocket.on('joinRequestAccepted', (data) => {
                // Request accepted, can now join chat
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
            
            // Remove from list
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
        }
    };

    const rejectRequest = (requestingUser) => {
        if (socket) {
            socket.emit('rejectJoinRequest', {
                room: currentRoom,
                requestingUser: requestingUser
            });
            
            // Remove from list
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
        }
    };

    const handleBackToRooms = () => {
        navigate('/rooms');
    };

    if (isRoomOwner) {
        // Room owner view: show join requests
        return (
            <div className="requestsPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen w-screen flex flex-col items-center p-4 md:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                        <button
                            onClick={handleBackToRooms}
                            className="absolute left-0 top-0 p-2 hover:bg-white/10 rounded-xl text-white transition-all"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Room: {currentRoom}
                        </h1>
                        <p className="text-purple-200 text-lg">Manage join requests for your room</p>
                    </div>

                    {joinRequests.length > 0 ? (
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="w-6 h-6" />
                                Join Requests ({joinRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {joinRequests.map((request, index) => (
                                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                {request.user.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-lg">{request.user}</h3>
                                                <p className="text-purple-200 text-sm">Wants to join your room</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => acceptRequest(request.user, request.socketId)}
                                                className="p-3 bg-green-500 hover:bg-green-600 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg"
                                                title="Accept"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(request.user)}
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
                    ) : (
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-300 opacity-50" />
                            <p className="text-white text-xl font-semibold mb-2">No join requests</p>
                            <p className="text-purple-200">Waiting for users to request to join your room...</p>
                        </div>
                    )}

                    <div className="text-center mt-8 pb-4">
                        <p className="text-white/50 text-sm">
                            Made with ❤️ by <span className="text-purple-300 font-semibold">Kartik Naphade</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        // Regular user view: waiting for acceptance
        return (
            <div className="requestsPage relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 min-h-screen w-screen flex flex-col items-center p-4 md:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center min-h-screen">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-purple-300 opacity-50 animate-pulse" />
                        <p className="text-white text-xl font-semibold mb-2">Waiting for approval</p>
                        <p className="text-purple-200">Your request to join <span className="font-semibold text-white">{currentRoom}</span> has been sent</p>
                        <p className="text-purple-300 text-sm mt-2">Waiting for room owner to accept...</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default Requests;
