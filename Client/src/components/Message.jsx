import React from 'react'

const Message = ({user, message, classs, timestamp}) => {
    const isRight = classs === 'right';
    const isAdmin = user === 'Admin';
    const userInitial = user ? user.charAt(0).toUpperCase() : 'U';
    
    // Generate a color based on username for consistency
    const getUserColor = (username) => {
        if (isAdmin) return 'bg-[linear-gradient(135deg,rgba(123,92,255,0.35),rgba(0,194,255,0.35))]';
        const colors = [
            'bg-[linear-gradient(135deg,#ff4d6d,#ff9a9e)]',
            'bg-[linear-gradient(135deg,#00c2ff,#7b5cff)]',
            'bg-[linear-gradient(135deg,#3dd686,#00ffb2)]',
            'bg-[linear-gradient(135deg,#ffd166,#ff9d66)]',
            'bg-[linear-gradient(135deg,#7b5cff,#b983ff)]',
            'bg-[linear-gradient(135deg,#ff6f91,#ff9671)]',
            'bg-[linear-gradient(135deg,#4ade80,#22c55e)]',
            'bg-[linear-gradient(135deg,#8df5c1,#3dd9d6)]',
            'bg-[linear-gradient(135deg,#a78bfa,#6366f1)]',
            'bg-[linear-gradient(135deg,#f97316,#fb7185)]'
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
            <div className="w-full flex justify-center my-3">
                <div className="crew-visor bg-[rgba(10,23,64,0.82)] border border-[rgba(0,194,255,0.35)] text-[#9fe9ff] text-xs px-4 py-2 rounded-full max-w-fit tracking-[0.16em]">
                    <span className="font-semibold text-white mr-1">{user}</span>
                    {message}
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full flex ${isRight ? 'justify-end' : 'justify-start'} my-2 group`}>
            <div className={`flex items-start gap-3 max-w-[70%] ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* User Avatar */}
                <div className={`${getUserColor(user)} w-11 h-11 rounded-2xl flex items-center justify-center text-[#060b23] font-semibold text-sm flex-shrink-0 shadow-[0_10px_25px_rgba(10,23,64,0.45)]`}>
                    {userInitial}
                </div>
                
                {/* Message Content */}
                <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} flex-1`}>
                    {!isRight && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-[0.25em] text-[rgba(199,208,255,0.7)]">{user}</span>
                            <span className="text-[0.65rem] text-[rgba(199,208,255,0.5)]">{formatTime(timestamp)}</span>
                        </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl ${
                        isRight 
                            ? 'bg-[linear-gradient(135deg,#00c2ff,#7b5cff)] text-[#050816]' 
                            : 'bg-[rgba(6,11,35,0.82)] text-[#f4f7ff] border border-[rgba(123,92,255,0.25)]'
                    } shadow-[0_18px_35px_rgba(6,11,35,0.45)]`}>
                        <div className="text-sm break-words leading-relaxed tracking-wide">
                            {message}
                        </div>
                        {isRight && timestamp && (
                            <div className="text-[0.65rem] mt-2 text-[#1b0b27] text-right uppercase tracking-[0.25em]">
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
