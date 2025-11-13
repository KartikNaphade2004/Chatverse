import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Plus, Zap, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socketIO from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SERVER_URL || "https://chatverse-backend-1041.onrender.com";

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [focused, setFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();
    const username = sessionStorage.getItem("user") || "";
    const socketRef = useRef(null);
    const timeoutRef = useRef(null);
    const creatingRoomRef = useRef(null);
    const handlersRef = useRef({});

    // Cleanup function
    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        creatingRoomRef.current = null;
        setIsCreating(false);
        setStatus("");
    }, []);

    // Handle room created
    const handleRoomCreated = useCallback((data) => {
        console.log('✅ Room created event received:', data);
        const currentRoom = creatingRoomRef.current;
        if (currentRoom && data && data.room === currentRoom) {
            console.log('✅ Room created successfully:', currentRoom);
            sessionStorage.setItem("room", currentRoom);
            sessionStorage.setItem("isRoomOwner", "true");
            cleanup();
            
            // Show success message briefly
            setStatus("Room created successfully! Redirecting...");
            setTimeout(() => {
                navigate('/requests');
            }, 500);
        }
    }, [navigate, cleanup]);

    // Handle room exists
    const handleRoomExists = useCallback((data) => {
        console.log('⚠️ Room exists event received:', data);
        const currentRoom = creatingRoomRef.current;
        if (currentRoom) {
            setError('Room already exists! Please choose a different name.');
            cleanup();
        }
    }, [cleanup]);

    // Handle error
    const handleError = useCallback((errorData) => {
        console.error('❌ Socket error received:', errorData);
        const currentRoom = creatingRoomRef.current;
        if (currentRoom) {
            setError(errorData?.message || 'An error occurred. Please try again.');
            cleanup();
        }
    }, [cleanup]);

    // Handle connect
    const handleConnect = useCallback(() => {
        console.log('🔌 Socket connected:', socketRef.current?.id);
        setIsConnected(true);
        setStatus("");
        
        // If we're trying to create a room, emit it now
        if (creatingRoomRef.current && isCreating) {
            console.log('📤 Socket connected, creating room:', creatingRoomRef.current);
            setStatus("Creating room...");
            socketRef.current?.emit('createRoom', {
                room: creatingRoomRef.current,
                user: username
            });
        }
    }, [username, isCreating]);

    // Handle disconnect
    const handleDisconnect = useCallback(() => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
        if (isCreating) {
            setStatus("Reconnecting...");
        }
    }, [isCreating]);

    // Handle connect error
    const handleConnectError = useCallback((err) => {
        console.error('❌ Connection error:', err);
        setIsConnected(false);
        if (creatingRoomRef.current) {
            setError('Failed to connect to server. Please check your connection and try again.');
            cleanup();
        }
    }, [cleanup]);

    useEffect(() => {
        if (!username) {
            navigate('/');
            return;
        }

        // Create socket connection
        const socket = socketIO(ENDPOINT, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000
        });

        socketRef.current = socket;

        // Store handlers in ref
        handlersRef.current = {
            handleRoomCreated,
            handleRoomExists,
            handleError,
            handleConnect,
            handleDisconnect,
            handleConnectError
        };

        // Set up event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('roomCreated', handleRoomCreated);
        socket.on('roomExists', handleRoomExists);
        socket.on('error', handleError);
        socket.on('connect_error', handleConnectError);

        // Check if already connected
        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('connect', handleConnect);
                socketRef.current.off('disconnect', handleDisconnect);
                socketRef.current.off('roomCreated', handleRoomCreated);
                socketRef.current.off('roomExists', handleRoomExists);
                socketRef.current.off('error', handleError);
                socketRef.current.off('connect_error', handleConnectError);
            }
            cleanup();
        };
    }, [username, navigate, handleRoomCreated, handleRoomExists, handleError, handleConnect, handleDisconnect, handleConnectError, cleanup]);

    const handleCreateRoom = () => {
        const trimmedRoomName = roomName.trim();
        if (!trimmedRoomName || !username || isCreating) {
            return;
        }

        setError("");
        setStatus("Creating room...");
        setIsCreating(true);
        creatingRoomRef.current = trimmedRoomName;

        const socket = socketRef.current;

        if (!socket) {
            setError('Socket not initialized. Please refresh the page.');
            cleanup();
            return;
        }

        // Set timeout for room creation (15 seconds)
        timeoutRef.current = setTimeout(() => {
            if (creatingRoomRef.current) {
                console.error('⏱️ Room creation timeout');
                setError('Room creation is taking too long. Please check your connection and try again.');
                cleanup();
            }
        }, 15000);

        // If socket is connected, emit immediately
        if (socket.connected) {
            console.log('📤 Socket connected, emitting createRoom:', trimmedRoomName);
            socket.emit('createRoom', {
                room: trimmedRoomName,
                user: username
            });
        } else {
            console.log('⏳ Socket not connected, waiting for connection...');
            setStatus("Connecting to server...");
            // The connect handler will emit when connected
        }
    };

    return (
        <div className="createRoomPage space-scene relative min-h-screen w-screen flex items-center justify-center p-6 md:p-12 text-white overflow-hidden">
            <div className="among-overlay"></div>

            <div className="relative z-10 w-full max-w-2xl mx-auto animate-fade-in">
                <div className="crew-card px-10 py-12 md:px-12 md:py-14">
                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="crew-visor text-xs md:text-sm gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={isCreating}
                            title="Back to rooms"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Hangar Bay
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="crew-tag">Dock Status</span>
                            {isConnected ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,194,255,0.15)] border border-[rgba(0,194,255,0.45)] text-[rgba(166,225,255,0.95)] text-xs font-semibold">
                                    <Wifi className="w-4 h-4 text-[#5eead4]" />
                                    Linked
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,77,109,0.12)] border border-[rgba(255,77,109,0.45)] text-[rgba(255,196,209,0.95)] text-xs font-semibold">
                                    <WifiOff className="w-4 h-4 text-[#f87171]" />
                                    Syncing...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-10 space-y-4">
                        <div className="relative inline-flex items-center justify-center">
                            <div className="absolute inset-0 blur-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(0,194,255,0.3),transparent_70%)]"></div>
                            <div className="relative w-24 h-24 md:w-28 md:h-28 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),rgba(0,194,255,0.15))] border border-[rgba(123,92,255,0.45)] rounded-[32%] flex items-center justify-center shadow-[0_25px_70px_rgba(15,23,66,0.65)]">
                                <Plus className="w-12 h-12 md:w-14 md:h-14 text-white" />
                            </div>
                        </div>
                        <span className="crew-tag inline-block">Mission Control</span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Spin Up A New Space</h1>
                        <p className="text-[var(--sus-text-secondary)] max-w-md mx-auto leading-relaxed">
                            Designate a codename for your crew’s private channel. You’ll captain the room—approve who beams aboard and keep impostors outside the airlock.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {error && (
                            <div className="among-card border border-[rgba(255,77,109,0.4)] bg-[rgba(45,12,30,0.85)] text-[#ffd6de] px-4 py-3 rounded-2xl text-sm font-medium animate-fade-in flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-[#ff99ac]" />
                                <span>{error}</span>
                            </div>
                        )}
                        {status && !error && (
                            <div className="among-card border border-[rgba(0,194,255,0.45)] bg-[rgba(7,20,45,0.85)] text-[#c7ecff] px-4 py-3 rounded-2xl text-sm font-medium animate-fade-in flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-[#7dd3fc] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                                <span>{status}</span>
                            </div>
                        )}

                        <div className="relative space-y-3">
                            <label className="block text-xs uppercase tracking-[0.24em] text-[var(--sus-text-secondary)] font-semibold">
                                Room Codename
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    autoFocus
                                    className={`sus-input w-full p-4 pl-5 text-lg rounded-2xl ${focused ? 'shadow-[0_0_0_3px_rgba(0,194,255,0.25)] scale-[1.01]' : ''}`}
                                    placeholder="e.g. ReactorBay, PolarisCrew, AstroOps"
                                    value={roomName}
                                    onChange={(e) => {
                                        setRoomName(e.target.value);
                                        setError("");
                                    }}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && roomName.trim() && !isCreating) {
                                            handleCreateRoom();
                                        } else if (e.key === 'Escape') {
                                            navigate('/rooms');
                                        }
                                    }}
                                    disabled={isCreating}
                                />
                                <div className="absolute -top-3 right-4">
                                    <span className="crew-visor text-xs">
                                        {focused ? 'Press Enter to confirm' : 'Case-sensitive'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-[var(--sus-text-secondary)] ml-1">Esc to abort • Naming is case-sensitive • Unique IDs unlock faster</p>
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            disabled={!roomName.trim() || isCreating || !isConnected}
                            className="sus-button w-full py-4 text-sm md:text-base rounded-2xl flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#1b0b27] border-t-transparent rounded-full animate-spin"></div>
                                    {status || "Initiating Launch..."}
                                </>
                            ) : !isConnected ? (
                                <>
                                    <WifiOff className="w-5 h-5" />
                                    Awaiting Link...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Deploy Room Capsule
                                </>
                            )}
                        </button>

                        {/* Quick Tips */}
                        <div className="among-card px-5 py-5 text-sm text-[var(--sus-text-secondary)] space-y-3 border border-[rgba(123,92,255,0.35)]">
                            <div className="flex items-center gap-2 uppercase tracking-[0.18em] text-xs text-[#a5b4ff] font-semibold">
                                <Zap className="w-4 h-4 text-[#ffd166]" />
                                Crew Manual
                            </div>
                            <ul className="space-y-2 text-sm leading-relaxed">
                                <li>• You become the captain—approve every boarding pass.</li>
                                <li>• Use unique codenames to keep impostors guessing.</li>
                                <li>• Keep the console open for live join requests.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Made by Credit */}
                    <div className="mt-10 text-center text-xs text-[var(--sus-text-secondary)] tracking-[0.2em] uppercase">
                        Crafted for the Crew by <span className="text-white font-semibold tracking-[0.25em]">Kartik Naphade</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
