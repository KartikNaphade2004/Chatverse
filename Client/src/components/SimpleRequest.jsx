import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users, MessageCircle, ArrowLeft, Sparkles, Wifi, WifiOff, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-01hn.onrender.com";

const SimpleRequest = () => {
    const [joinRequests, setJoinRequests] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const navigate = useNavigate();
    const currentUser = sessionStorage.getItem("user") || "Anonymous";
    const MAIN_ROOM = "Main Chat Room";

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }

        const newSocket = socketIO(ENDPOINT, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
            
            // Check if user already has access
            newSocket.emit('checkAccess', { user: currentUser, room: MAIN_ROOM });
            
            // Get pending requests if user is admin
            newSocket.emit('getJoinRequests', { room: MAIN_ROOM });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('hasAccess', () => {
            setIsAccepted(true);
            setTimeout(() => navigate('/chat'), 1000);
        });

        newSocket.on('joinRequests', (requests) => {
            setJoinRequests(requests);
        });

        newSocket.on('newJoinRequest', () => {
            newSocket.emit('getJoinRequests', { room: MAIN_ROOM });
        });

        newSocket.on('joinRequestSent', () => {
            setHasRequested(true);
        });

        newSocket.on('joinRequestAccepted', () => {
            setIsAccepted(true);
            setTimeout(() => navigate('/chat'), 1000);
        });

        newSocket.on('joinRequestRejected', () => {
            setHasRequested(false);
            alert('Your request was rejected. You can request again.');
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [currentUser, navigate]);

    const handleRequestJoin = () => {
        if (socket && socket.connected) {
            socket.emit('requestJoinRoom', {
                room: MAIN_ROOM,
                user: currentUser
            });
        }
    };

    const acceptRequest = (requestingUser, requestingSocketId) => {
        if (socket) {
            socket.emit('acceptJoinRequest', {
                room: MAIN_ROOM,
                requestingUser: requestingUser,
                requestingSocketId: requestingSocketId
            });
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
        }
    };

    const rejectRequest = (requestingUser) => {
        if (socket) {
            socket.emit('rejectJoinRequest', {
                room: MAIN_ROOM,
                requestingUser: requestingUser
            });
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
        }
    };

    // Check if user is in room (can manage requests)
    const [isInRoom, setIsInRoom] = useState(false);
    
    useEffect(() => {
        if (socket) {
            socket.on('hasAccess', () => {
                setIsInRoom(true);
            });
            socket.on('noAccess', () => {
                setIsInRoom(false);
            });
        }
    }, [socket]);
    
    const canManageRequests = isInRoom && joinRequests.length > 0;

    if (isAccepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center space-y-4 animate-fade-in">
                    <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-700">Request Accepted!</h2>
                    <p className="text-gray-600">Redirecting to chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all hover:scale-110"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                    <Wifi className="w-4 h-4 text-green-500" />
                                    <span className="text-green-700 text-xs font-medium">Connected</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                                    <WifiOff className="w-4 h-4 text-red-500" />
                                    <span className="text-red-700 text-xs font-medium">Connecting...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                            <MessageCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {MAIN_ROOM}
                        </h1>
                        <p className="text-gray-600">Request to join and start chatting!</p>
                    </div>

                    {/* Request Button or Status */}
                    {!hasRequested ? (
                        <button
                            onClick={handleRequestJoin}
                            disabled={!isConnected}
                            className="w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            <UserPlus className="w-5 h-5" />
                            Request to Join
                        </button>
                    ) : (
                        <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-6 py-4 rounded-xl text-center animate-fade-in">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-semibold">Request Sent!</span>
                            </div>
                            <p className="text-sm">Waiting for approval...</p>
                        </div>
                    )}
                </div>

                {/* Admin Section - Show Requests */}
                {canManageRequests && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-500" />
                            Pending Requests ({joinRequests.length})
                        </h2>
                        <div className="space-y-4">
                            {joinRequests.map((request, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 flex items-center justify-between border-2 border-gray-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {request.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-gray-800 font-bold text-lg">{request.user}</h3>
                                            <p className="text-gray-500 text-sm">Wants to join the chat</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => acceptRequest(request.user, request.socketId)}
                                            className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white transition-all hover:scale-110 shadow-lg transform hover:rotate-12"
                                            title="Accept"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(request.user)}
                                            className="p-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl text-white transition-all hover:scale-110 shadow-lg transform hover:rotate-12"
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
            </div>
        </div>
    );
};

export default SimpleRequest;

