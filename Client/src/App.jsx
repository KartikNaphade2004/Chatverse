import React from 'react'
// import socketio from 'socket.io-client'
import './App.css'
import {BrowserRouter as Router , Route , Routes } from "react-router-dom"
import Join from './components/Join/Join.jsx'
import Chat from './components/chat.jsx'
import { useState } from 'react'

// const ENDPOINT = `http://localhost:3000/`; //socket is serveed from the server running on this url
// const socket = socketio(ENDPOINT , {transports :['websocket']});

const App = () => {
    
 
  // socket.on("connection",(req,res)=>{
  //   console.log("New connection established!");
  // })
  return (
    
          <div className='App'>
          <Router>
          <Routes>
          <Route path="/" element={<Join/>}/>
          <Route path="/chat" element={<Chat/>}/>
          </Routes>
          </Router>
          </div>
   
    
  )
}

export default App