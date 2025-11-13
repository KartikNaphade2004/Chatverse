import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users, MessageCircle, ArrowLeft, Sparkles } from 'lucide-react';
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
            <div className="requestsPage space-scene relative min-h-screen w-screen flex flex-col items-center p-6 md:p-12 text-white overflow-hidden">
                <div className="among-overlay"></div>

                <div className="relative z-10 w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
                    <div className="crew-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <span className="crew-tag">Docking Bay</span>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-3">
                                Manage Boarding Requests — {currentRoom}
                            </h1>
                            <p className="text-[var(--sus-text-secondary)] max-w-lg mt-2">
                                You’re in charge of this starship. Review incoming transmissions and decide who gets to step through the airlock.
                            </p>
                        </div>
                        <button
                            onClick={handleBackToRooms}
                            className="crew-visor justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Galaxy
                        </button>
                    </div>

                    {joinRequests.length > 0 ? (
                        <div className="space-y-4">
                            {joinRequests.map((request, index) => (
                                <div
                                    key={index}
                                    className="among-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 border border-[rgba(123,92,255,0.35)] animate-fade-in"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-[linear-gradient(135deg,rgba(0,194,255,0.35),rgba(123,92,255,0.45))] flex items-center justify-center text-white text-2xl font-bold shadow-[0_18px_45px_rgba(12,25,68,0.65)]">
                                            {request.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold">{request.user}</h3>
                                            <p className="text-[var(--sus-text-secondary)] text-sm mt-1">
                                                Requesting to join your crew channel
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => acceptRequest(request.user, request.socketId)}
                                            className="sus-button px-5 py-2 text-sm flex items-center gap-2"
                                            title="Accept request"
                                        >
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(request.user)}
                                            className="crew-visor px-5 py-2 text-sm flex items-center gap-2 bg-[rgba(255,77,109,0.18)] border border-[rgba(255,118,107,0.45)] text-[#ffc6d9]"
                                            title="Reject request"
                                        >
                                            <X className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="crew-card p-12 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),rgba(0,194,255,0.2))] rounded-3xl flex items-center justify-center shadow-[0_20px_55px_rgba(10,16,40,0.65)]">
                                <MessageCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">No boarding requests yet</h2>
                            <p className="text-[var(--sus-text-secondary)] max-w-md mx-auto leading-relaxed">
                                Keep the console open. We’ll ping you the moment a new crewmate pings the hatch.
                            </p>
                        </div>
                    )}

                    <div className="text-center pb-6 text-xs text-[var(--sus-text-secondary)] uppercase tracking-[0.2em]">
                        Captain: <span className="text-white font-semibold tracking-[0.25em]">{currentUser}</span>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="requestsPage space-scene relative min-h-screen w-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
                <div className="among-overlay"></div>
                <div className="relative z-10 w-full max-w-lg mx-auto animate-fade-in">
                    <div className="crew-card p-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),rgba(123,92,255,0.3))] rounded-3xl flex items-center justify-center animate-pulse shadow-[0_20px_55px_rgba(7,14,38,0.65)]">
                            <MessageCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Awaiting Airlock Clearance</h2>
                        <p className="text-[var(--sus-text-secondary)] leading-relaxed mb-4">
                            Your boarding request for <span className="text-white font-semibold">{currentRoom}</span> is in the captain’s queue.
                        </p>
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--sus-text-secondary)]">
                            Stay sharp — we’ll warp you in once they approve.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
};

export default Requests;
