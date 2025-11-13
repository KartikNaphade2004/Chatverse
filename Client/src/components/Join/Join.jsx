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
      navigate('/rooms');
    }
   }

  return (
    <div className='JoinPage space-scene relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6 py-12 text-white'>
      <div className="among-overlay"></div>
      <div className="floating-ship hidden md:block"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-xl mx-auto animate-fade-in">
        <div className="crew-card px-10 py-12 md:px-12 md:py-14">
          {/* Logo and Title */}
          <div className='text-center mb-10 space-y-5 relative z-10'>
            <div className='flex items-center justify-center mb-4'>
              <div className="relative">
                <div className="absolute inset-0 blur-3xl opacity-60 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,77,109,0.55),rgba(0,194,255,0.4),rgba(123,92,255,0.6),rgba(255,77,109,0.55))] animate-pulse"></div>
                <img 
                  src={logo} 
                  className='w-28 h-28 md:w-32 md:h-32 relative z-10 drop-shadow-[0_20px_45px_rgba(0,194,255,0.45)] animate-float-slow' 
                  alt="ChatVerse Logo"
                />
              </div>
            </div>
            <span className="crew-tag inline-flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Crew Lobby Console
            </span>
            <h1 className='text-5xl md:text-6xl font-black tracking-tight'>
              Welcome, Crewmate!
            </h1>
            <p className="text-base md:text-lg text-[var(--sus-text-secondary)] max-w-sm mx-auto leading-relaxed">
              Suit up, enter your codename, and dock into the <span className="text-white font-semibold">ChatVerse starship</span>. Every room is a new mission—no impostors allowed!
            </p>
          </div>

          {/* Join Form */}
          <div className='space-y-6 relative z-10'>
            <div className='relative space-y-3'>
              <label className="block text-sm uppercase tracking-[0.22em] text-[var(--sus-text-secondary)] font-semibold">
                Crew Codename
              </label>
              <div className="relative group">
                <input
                  type="text"
                  className={`sus-input w-full p-4 pl-5 text-lg rounded-2xl transition-all duration-300 ${
                    focused ? 'shadow-[0_0_0_3px_rgba(0,194,255,0.25)] scale-[1.01]' : ''
                  }`}
                  placeholder="e.g. RedSus, AstroKate, LunarWolf"
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
                <div className="absolute -top-3 right-5">
                  <span className="crew-visor text-xs">
                    Press Enter
                  </span>
                </div>
              </div>
            </div>

            <button 
              className="sus-button group relative w-full py-4 text-base rounded-2xl tracking-[0.18em] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleContinue}
              disabled={!username.trim()}
            >
              Initiate Launch
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="sus-divider"></div>

          {/* Experience Callout */}
          <div className="relative z-10 text-[var(--sus-text-secondary)] text-sm leading-relaxed text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#ffb703]" />
              <span className="uppercase tracking-[0.24em] text-xs">Mission Briefing</span>
              <Sparkles className="w-4 h-4 text-[#8ecae6]" />
            </div>
            <p>
              Squad up with your crew, open secret channels, and broadcast across the galaxy in real time. Your visor is clear, captain!
            </p>
          </div>

          {/* Made by Credit */}
          <div className="mt-10 text-center text-xs text-[var(--sus-text-secondary)] tracking-[0.2em] uppercase">
            Crafted by <span className="text-white font-semibold tracking-[0.25em]">Kartik Naphade</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join
