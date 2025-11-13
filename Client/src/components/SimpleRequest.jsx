import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserPlus, Check, X, Users, MessageCircle, ArrowLeft, Sparkles, Wifi, WifiOff, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-01hn.onrender.com";

const SimpleRequest = () => {
    const [joinRequests, setJoinRequests] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const navigate = useNavigate();
    const currentUser = sessionStorage.getItem("user") || "Anonymous";
    const MAIN_ROOM = "Main Chat Room";
    const { toasts, showToast, removeToast } = useToast();

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
            console.log('Connected to server', newSocket.id);
            setIsConnected(true);
            
            // Check if user already has access
            newSocket.emit('checkAccess', { user: currentUser, room: MAIN_ROOM });
            
            // Always try to get pending requests (will return empty if not in room)
            // Add small delay to ensure room state is updated
            setTimeout(() => {
                newSocket.emit('getJoinRequests', { room: MAIN_ROOM });
            }, 500);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('hasAccess', () => {
            console.log('User has access to room');
            setIsInRoom(true);
            // Refresh requests list when user has access
            setTimeout(() => {
                if (newSocket.connected) {
                    newSocket.emit('getJoinRequests', { room: MAIN_ROOM });
                }
            }, 300);
        });

        newSocket.on('joinRequests', (requests) => {
            console.log('Received join requests:', requests);
            setJoinRequests(requests || []);
        });

        newSocket.on('newJoinRequest', (data) => {
            console.log('New join request received:', data);
            // Refresh requests list when new request comes in
            if (newSocket.connected) {
                setTimeout(() => {
                    newSocket.emit('getJoinRequests', { room: MAIN_ROOM });
                }, 200);
            }
        });

        newSocket.on('joinRequestSent', () => {
            setHasRequested(true);
            showToast('Request sent successfully!', 'success');
        });

        newSocket.on('joinRequestAccepted', () => {
            setIsInRoom(true);
            // Don't auto-navigate - let user stay to see requests or manually go to chat
            showToast('You are now in the room!', 'success');
        });

        newSocket.on('joinRequestRejected', () => {
            setHasRequested(false);
            showToast('Your request was rejected. You can request again.', 'error');
        });

        newSocket.on('hasAccess', () => {
            setIsInRoom(true);
        });

        newSocket.on('noAccess', () => {
            setIsInRoom(false);
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [currentUser, navigate]);

    const handleRequestJoin = useCallback(() => {
        if (socket && socket.connected) {
            socket.emit('requestJoinRoom', {
                room: MAIN_ROOM,
                user: currentUser
            });
        } else {
            showToast('Not connected to server. Please wait...', 'warning');
        }
    }, [socket, currentUser, showToast]);

    const acceptRequest = useCallback((requestingUser, requestingSocketId) => {
        if (socket) {
            socket.emit('acceptJoinRequest', {
                room: MAIN_ROOM,
                requestingUser: requestingUser,
                requestingSocketId: requestingSocketId
            });
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
            showToast(`${requestingUser} has been accepted!`, 'success');
        }
    }, [socket, showToast]);

    const rejectRequest = useCallback((requestingUser) => {
        if (socket) {
            socket.emit('rejectJoinRequest', {
                room: MAIN_ROOM,
                requestingUser: requestingUser
            });
            setJoinRequests(prev => prev.filter(req => req.user !== requestingUser));
            showToast(`${requestingUser} has been rejected.`, 'info');
        }
    }, [socket, showToast]);
    
    const canManageRequests = useMemo(() => {
        // User can manage requests if they're in room AND there are requests
        // Also show if in room even with 0 requests (to show "No pending requests" message)
        return isInRoom;
    }, [isInRoom]);

    // Remove auto-navigation - let user stay on page to manage requests

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
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
                    {!isInRoom ? (
                        !hasRequested ? (
                            <button
                                onClick={handleRequestJoin}
                                disabled={!isConnected}
                                className="w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                            >
                                <UserPlus className="w-5 h-5" />
                                Request to Join
                            </button>
                        ) : (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 px-6 py-4 rounded-xl text-center animate-fade-in">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                    <span className="font-semibold">Request Sent!</span>
                                </div>
                                <p className="text-sm">Waiting for approval from room members...</p>
                            </div>
                        )
                    ) : (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-xl text-center animate-fade-in">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-semibold">You're in the room!</span>
                            </div>
                            <p className="text-sm">You can manage requests below or go to chat</p>
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
                        {joinRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-lg font-semibold">No pending requests</p>
                                <p className="text-sm">Waiting for users to request access...</p>
                            </div>
                        ) : (
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
                        )}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => navigate('/chat')}
                                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Go to Chat Room
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default SimpleRequest;

