import React from 'react'

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
            'bg-red-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
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
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full max-w-fit border border-gray-200">
                    <span className="font-semibold text-gray-700">{user}</span>: <span className="text-gray-600">{message}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full flex ${isRight ? 'justify-end' : 'justify-start'} my-2 group animate-fade-in`}>
            <div className={`flex items-start gap-3 max-w-[70%] ${isRight ? 'flex-row-reverse' : 'flex-row'} hover-lift`}>
                {/* User Avatar */}
                <div className={`${getUserColor(user)} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0 shadow-lg transform transition-transform group-hover:scale-110`}>
                    {userInitial}
                </div>
                
                {/* Message Content */}
                <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} flex-1`}>
                    {!isRight && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800">{user}</span>
                            <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
                        </div>
                    )}
                    <div className={`px-5 py-3 rounded-2xl transition-all duration-300 ${
                        isRight 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                            : 'bg-white text-gray-800 border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300'
                    }`}>
                        <div className="text-sm break-words leading-relaxed">
                            {message}
                        </div>
                        {isRight && timestamp && (
                            <div className="text-xs mt-1 text-blue-100 text-right opacity-80">
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
