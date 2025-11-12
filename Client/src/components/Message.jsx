import React from 'react'

const Message = ({user, message, classs, timestamp}) => {
    const isRight = classs === 'right';
    const isAdmin = user === 'Admin';
    const userInitial = user ? user.charAt(0).toUpperCase() : 'U';
    
    // Generate a color based on username for consistency
    const getUserColor = (username) => {
        if (isAdmin) return 'bg-gradient-to-br from-gray-400 to-gray-500';
        const gradients = [
            'bg-gradient-to-br from-blue-400 to-blue-600',
            'bg-gradient-to-br from-green-400 to-green-600',
            'bg-gradient-to-br from-purple-400 to-purple-600',
            'bg-gradient-to-br from-pink-400 to-pink-600',
            'bg-gradient-to-br from-yellow-400 to-yellow-600',
            'bg-gradient-to-br from-indigo-400 to-indigo-600',
            'bg-gradient-to-br from-red-400 to-red-600',
            'bg-gradient-to-br from-teal-400 to-teal-600',
            'bg-gradient-to-br from-orange-400 to-orange-600',
            'bg-gradient-to-br from-cyan-400 to-cyan-600'
        ];
        const index = username ? username.charCodeAt(0) % gradients.length : 0;
        return gradients[index];
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (isAdmin) {
        return (
            <div className="w-full flex justify-center my-3">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs md:text-sm px-4 py-2 rounded-full max-w-fit shadow-sm border border-gray-300/50">
                    <span className="font-semibold text-gray-700">{user}</span>: <span className="text-gray-600">{message}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full flex ${isRight ? 'justify-end' : 'justify-start'} my-2 px-2 md:px-4 animate-fade-in`}>
            <div className={`flex items-end gap-2 max-w-[75%] md:max-w-[65%] ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* User Avatar */}
                <div className={`${getUserColor(user)} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0 shadow-lg ring-2 ring-white`}>
                    {userInitial}
                </div>
                
                {/* Message Bubble */}
                <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} space-y-1`}>
                    {!isRight && (
                        <div className="text-xs font-semibold text-gray-600 px-2">
                            {user}
                        </div>
                    )}
                    <div className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                        isRight 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                    }`}>
                        <div className="text-sm md:text-base break-words leading-relaxed">
                            {message}
                        </div>
                        {timestamp && (
                            <div className={`text-xs mt-1.5 ${isRight ? 'text-blue-100' : 'text-gray-500'}`}>
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
