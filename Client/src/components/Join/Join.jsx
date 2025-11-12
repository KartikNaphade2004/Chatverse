import React , {useState} from 'react'
import './Join.css'
import logo from '../../images/logo.png'
import {Link} from 'react-router-dom'
import { MessageCircle, Users, Zap, Shield, Globe, Code } from 'lucide-react'

const Join = () => {
   const [username , setUsername] = useState(""); 
   const sendUser = () =>{
    sessionStorage.setItem("user", username);
      setUsername("");
    }
  return (
    <div className='JoinPage bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen w-full flex flex-col items-center justify-center py-8 px-4'>
      {/* Hero Section */}
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center mb-4'>
            <img src={logo} className='w-24 h-24 md:w-32 md:h-32 animate-pulse' alt="ChatVerse Logo"></img>
          </div>
          <h1 className='text-white text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
            ChatVerse
          </h1>
          <p className='text-gray-300 text-lg md:text-xl mt-2'>
            Real-Time Multi-User Chat Application
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div className='bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300'>
            <MessageCircle className='w-8 h-8 text-blue-400 mb-3' />
            <h3 className='text-white font-semibold mb-2'>Real-Time Chat</h3>
            <p className='text-gray-400 text-sm'>Instant messaging with WebSocket technology</p>
          </div>
          <div className='bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300'>
            <Users className='w-8 h-8 text-purple-400 mb-3' />
            <h3 className='text-white font-semibold mb-2'>Multi-User</h3>
            <p className='text-gray-400 text-sm'>Multiple users can chat simultaneously</p>
          </div>
          <div className='bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-all duration-300'>
            <Zap className='w-8 h-8 text-green-400 mb-3' />
            <h3 className='text-white font-semibold mb-2'>Fast & Reliable</h3>
            <p className='text-gray-400 text-sm'>Built with React 19 and Node.js</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className='bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-gray-700 mb-8'>
          <div className='flex items-center justify-center gap-2 mb-4'>
            <Code className='w-6 h-6 text-blue-400' />
            <h3 className='text-white font-semibold text-xl'>Tech Stack</h3>
          </div>
          <div className='flex flex-wrap justify-center gap-3'>
            <span className='px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium'>React 19</span>
            <span className='px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium'>Node.js</span>
            <span className='px-4 py-2 bg-white text-black rounded-full text-sm font-medium'>Socket.IO</span>
            <span className='px-4 py-2 bg-cyan-600 text-white rounded-full text-sm font-medium'>Tailwind CSS</span>
            <span className='px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium'>Express</span>
            <span className='px-4 py-2 bg-yellow-600 text-white rounded-full text-sm font-medium'>Vite</span>
          </div>
        </div>

        {/* Join Container */}
        <div className="JoinContainer bg-gray-800 bg-opacity-70 backdrop-blur-sm w-full max-w-md mx-auto p-8 rounded-xl border-2 border-gray-700 shadow-2xl">
          <div className='flex flex-col items-center justify-center'>
            <div className='mb-6 text-center'>
              <Globe className='w-12 h-12 text-blue-400 mx-auto mb-3' />
              <h2 className='text-white text-2xl font-semibold mb-2'>Join Chat Room</h2>
              <p className='text-gray-400 text-sm'>Enter your name to start chatting</p>
            </div>

            <input
              type="text"
              className="bg-gray-700 text-white w-full p-4 text-lg rounded-lg outline-none border-2 border-gray-600 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
              placeholder="Enter Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && username.trim()) {
                  sendUser();
                  window.location.href = '/chat';
                }
              }}
              id="username"
            />

            <Link to={'/chat'} className="w-full mt-4">
              <button 
                className="w-full p-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg" 
                onClick={(e)=>{
                  if(!username.trim()){
                    e.preventDefault();
                  } else {
                    sendUser();
                  }
                }}
                disabled={!username.trim()}
              >
                Join Chat Room →
              </button>
            </Link>

            <div className='mt-6 text-center'>
              <p className='text-gray-400 text-xs'>
                By joining, you agree to our terms of service
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className='text-center mt-8'>
          <p className='text-gray-400 text-sm'>
            Built with ❤️ by Kartik Naphade • 
            <a href="https://github.com/KartikNaphade2004/Chatverse" target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:text-blue-300 ml-1'>
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Join
