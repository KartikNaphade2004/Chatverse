import React from 'react'
import { User } from 'lucide-react'

const Message = ({user, message, classs, timestamp}) => {
    const isRight = classs === 'right';
    const isAdmin = user === 'Admin';
    const userInitial = user ? user.charAt(0).toUpperCase() : 'U';
    
    // Generate a color based on username for consistency
    const getUserColor = (username) => {
        if (isAdmin) return 'bg-gray-500';
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
            'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500',
            'bg-red-500', 'bg-teal-500'
        ];
        const index = username ? username.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (isAdmin) {
        return (
            <div className="w-full flex justify-center my-2">
                <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full max-w-fit">
                    <span className="font-medium">{user}</span>: {message}
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full flex ${isRight ? 'justify-end' : 'justify-start'} my-2 px-4`}>
            <div className={`flex items-start gap-3 max-w-[70%] ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* User Avatar */}
                <div className={`${getUserColor(user)} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md`}>
                    {userInitial}
                </div>
                
                {/* Message Bubble */}
                <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-md ${
                        isRight 
                            ? 'bg-blue-500 text-white rounded-br-sm' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                        {!isRight && (
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                                {user}
                            </div>
                        )}
                        <div className="text-base break-words">
                            {message}
                        </div>
                        {timestamp && (
                            <div className={`text-xs mt-1 ${isRight ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatTime(timestamp)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Message
