import React , {useState} from 'react'
import './Join.css'
import logo from '../../images/logo.png'
import {useNavigate} from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const Join = () => {
   const [username, setUsername] = useState("");
   const [focused, setFocused] = useState(false);
   const navigate = useNavigate();

   const handleContinue = () => {
    if (username.trim()) {
      sessionStorage.setItem("user", username.trim());
      // Redirect to rooms list
      navigate('/rooms');
    }
   }

  return (
    <div className='JoinPage relative min-h-screen w-full flex items-center justify-center overflow-hidden'>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="JoinContainer bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
          {/* Logo and Title */}
          <div className='text-center mb-10 space-y-4'>
            <div className='flex items-center justify-center mb-6'>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <img 
                  src={logo} 
                  className='w-24 h-24 md:w-28 md:h-28 relative z-10 drop-shadow-2xl animate-float-slow' 
                  alt="ChatVerse Logo"
                />
              </div>
            </div>
            <h1 className='text-white text-5xl md:text-6xl font-extrabold mb-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg'>
              ChatVerse
            </h1>
            <div className="flex items-center justify-center gap-2 text-purple-200 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Chat Experience</span>
            </div>
          </div>

          {/* Join Form */}
          <div className='space-y-6'>
            <div className='relative'>
              <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                Enter Your Name
              </label>
              <input
                type="text"
                className={`w-full p-4 text-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/60 rounded-xl outline-none border-2 transition-all duration-300 ${
                  focused
                    ? 'border-purple-400 shadow-lg shadow-purple-500/50 scale-[1.02]' 
                    : 'border-white/30 hover:border-white/50'
                }`}
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && username.trim()) {
                    handleContinue();
                  }
                }}
                id="username"
              />
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl -z-10 blur-xl transition-opacity duration-300 ${focused ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

            <button 
              className="group w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden"
              onClick={handleContinue}
              disabled={!username.trim()}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-xs">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30"></div>
            <span>Secure & Fast</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30"></div>
          </div>

          {/* Made by Credit */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              Made with ❤️ by <span className="text-purple-300 font-semibold">Kartik Naphade</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join
