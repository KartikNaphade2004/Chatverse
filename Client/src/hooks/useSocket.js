import { useEffect, useState, useRef, useCallback } from 'react';
import socketIO from 'socket.io-client';

export const useSocket = (endpoint, options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = socketIO(endpoint, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            ...options
        });

        socket.on('connect', () => {
            setIsConnected(true);
            setSocketId(socket.id);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            setSocketId(null);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        socketRef.current = socket;

        return () => {
            if (socket) {
                socket.off();
                socket.disconnect();
            }
        };
    }, [endpoint]);

    const emit = useCallback((event, data) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data);
        }
    }, []);

    const on = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    const off = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        socketId,
        emit,
        on,
        off
    };
};

