import React from 'react'
import './App.css'
import {BrowserRouter as Router , Route , Routes } from "react-router-dom"
import Join from './components/Join/Join.jsx'
import Chat from './components/chat.jsx'
import Requests from './components/Requests.jsx'

const App = () => {
  return (
    <div className='App'>
      <Router>
        <Routes>
          <Route path="/" element={<Join/>}/>
          <Route path="/requests" element={<Requests/>}/>
          <Route path="/chat" element={<Chat/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
