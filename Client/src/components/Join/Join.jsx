import React, { useState, useCallback, useMemo } from 'react'
import './Join.css'
import logo from '../../images/logo.png'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, TrendingUp, Shield, Zap as ZapIcon } from 'lucide-react'

const Join = () => {
   const [username, setUsername] = useState("");
   const [focused, setFocused] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const navigate = useNavigate();

   const isValidUsername = useMemo(() => {
     return username.trim().length >= 2 && username.trim().length <= 20;
   }, [username]);

   const handleContinue = useCallback(() => {
    if (isValidUsername && !isSubmitting) {
      setIsSubmitting(true);
      // Simulate smooth transition
      setTimeout(() => {
        sessionStorage.setItem("user", username.trim());
        navigate('/request');
      }, 300);
    }
   }, [username, isValidUsername, isSubmitting, navigate]);

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
        <div className="JoinContainer glass rounded-3xl p-10 shadow-2xl border border-white/30 animate-glow">
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
            <h1 className='text-6xl md:text-7xl font-extrabold mb-2 gradient-text-vibrant animate-fade-in'>
              Chat Verse
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span>Real-Time Chat Experience</span>
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-1">
                <ZapIcon className="w-3 h-3" />
                <span>Fast</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Real-time</span>
              </div>
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
                  className={`w-full p-4 pl-5 text-lg bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-400 rounded-xl outline-none border-2 transition-all duration-300 shadow-md ${
                    focused
                      ? 'border-blue-500 shadow-xl shadow-blue-500/40 scale-[1.02] ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                  } ${!isValidUsername && username.length > 0 ? 'border-red-400 shadow-red-200/50' : ''}`}
                  placeholder="Enter your name (2-20 characters)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isValidUsername) {
                      handleContinue();
                    }
                  }}
                  id="username"
                  maxLength={20}
                />
                {username.length > 0 && !isValidUsername && (
                  <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">
                    Name must be 2-20 characters
                  </p>
                )}
                {focused && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl -z-10 blur-xl"></div>
                )}
              </div>
            </div>

            <button 
              className="group relative w-full p-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden animate-bounce-in"
              onClick={handleContinue}
              disabled={!isValidUsername || isSubmitting}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
