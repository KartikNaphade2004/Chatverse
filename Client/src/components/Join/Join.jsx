import React , {useState} from 'react'
import './Join.css'
import logo from '../../images/logo.png'
import {useNavigate} from 'react-router-dom'
import { ArrowRight, Sparkles, Zap } from 'lucide-react'

const Join = () => {
   const [username, setUsername] = useState("");
   const [focused, setFocused] = useState(false);
   const navigate = useNavigate();

   const handleContinue = () => {
    if (username.trim()) {
      sessionStorage.setItem("user", username.trim());
      navigate('/request');
    }
   }

  return (
    <div className='JoinPage relative min-h-screen w-full flex items-center justify-center overflow-hidden'>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2RjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 animate-fade-in">
        <div className="JoinContainer bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50">
          {/* Logo and Title */}
          <div className='text-center mb-10 space-y-4'>
            <div className='flex items-center justify-center mb-6'>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <img 
                  src={logo} 
                  className='w-28 h-28 md:w-32 md:h-32 relative z-10 drop-shadow-2xl animate-float-slow' 
                  alt="ChatVerse Logo"
                />
              </div>
            </div>
            <h1 className='text-6xl md:text-7xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Chat Verse
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span>Real-Time Chat Experience</span>
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          {/* Join Form */}
          <div className='space-y-6'>
            <div className='relative'>
              <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">
                Enter Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full p-4 pl-5 text-lg bg-gradient-to-r from-gray-50 to-white text-gray-800 placeholder-gray-400 rounded-xl outline-none border-2 transition-all duration-300 shadow-sm ${
                    focused
                      ? 'border-blue-500 shadow-lg shadow-blue-500/30 scale-[1.01]' 
                      : 'border-gray-200 hover:border-blue-300'
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
                {focused && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl -z-10 blur-xl"></div>
                )}
              </div>
            </div>

            <button 
              className="group relative w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
              onClick={handleContinue}
              disabled={!username.trim()}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300"></div>
            <span className="font-medium">Secure & Fast</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300"></div>
          </div>

          {/* Made by Credit */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              Made with <span className="text-red-500">❤️</span> by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join
