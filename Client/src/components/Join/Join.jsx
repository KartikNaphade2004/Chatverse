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
      navigate('/rooms');
    }
   }

  return (
    <div className='JoinPage relative min-h-screen w-full flex items-center justify-center bg-gray-50'>
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="JoinContainer bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
          {/* Logo and Title */}
          <div className='text-center mb-10 space-y-4'>
            <div className='flex items-center justify-center mb-6'>
              <div className="relative">
                <img 
                  src={logo} 
                  className='w-24 h-24 md:w-28 md:h-28 relative z-10 drop-shadow-lg' 
                  alt="ChatVerse Logo"
                />
              </div>
            </div>
            <h1 className='text-gray-800 text-5xl md:text-6xl font-extrabold mb-2'>
              ChatVerse
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Chat Experience</span>
            </div>
          </div>

          {/* Join Form */}
          <div className='space-y-6'>
            <div className='relative'>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Enter Your Name
              </label>
              <input
                type="text"
                className={`w-full p-4 text-lg bg-gray-50 text-gray-800 placeholder-gray-400 rounded-lg outline-none border-2 transition-all duration-300 ${
                  focused
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-300 hover:border-gray-400'
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
            </div>

            <button 
              className="group w-full p-4 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              onClick={handleContinue}
              disabled={!username.trim()}
            >
              <span className="flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
            <div className="h-px w-16 bg-gray-300"></div>
            <span>Secure & Fast</span>
            <div className="h-px w-16 bg-gray-300"></div>
          </div>

          {/* Made by Credit */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              Made with ❤️ by <span className="text-blue-600 font-semibold">Kartik Naphade</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join
