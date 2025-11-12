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
            <div className="requestsPage relative bg-gray-50 min-h-screen w-screen flex flex-col items-center p-4 md:p-8">
                <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                        <button
                            onClick={handleBackToRooms}
                            className="mb-4 p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-gray-800 text-3xl md:text-4xl font-bold mb-2">
                            Room: {currentRoom}
                        </h1>
                        <p className="text-gray-500">Manage join requests for your room</p>
                    </div>

                    {joinRequests.length > 0 ? (
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <h2 className="text-gray-800 text-xl font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Join Requests ({joinRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {joinRequests.map((request, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                                {request.user.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-gray-800 font-semibold text-lg">{request.user}</h3>
                                                <p className="text-gray-500 text-sm">Wants to join your room</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => acceptRequest(request.user, request.socketId)}
                                                className="p-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-all hover:scale-110 shadow-md"
                                                title="Accept"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(request.user)}
                                                className="p-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-all hover:scale-110 shadow-md"
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
                        <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-md text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-800 text-xl font-semibold mb-2">No join requests</p>
                            <p className="text-gray-500">Waiting for users to request to join your room...</p>
                        </div>
                    )}

                    <div className="text-center pb-4">
                        <p className="text-gray-400 text-sm">
                            Made with ❤️ by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="requestsPage relative bg-gray-50 min-h-screen w-screen flex flex-col items-center p-4 md:p-8">
                <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center min-h-screen">
                    <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-md text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                        <p className="text-gray-800 text-xl font-semibold mb-2">Waiting for approval</p>
                        <p className="text-gray-600">Your request to join <span className="font-semibold text-gray-800">{currentRoom}</span> has been sent</p>
                        <p className="text-gray-500 text-sm mt-2">Waiting for room owner to accept...</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default Requests;
