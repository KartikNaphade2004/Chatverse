import React, { Suspense } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Join from './components/Join/Join.jsx'
import Chat from './components/chat.jsx'
import SimpleRequest from './components/SimpleRequest.jsx'
import { PageLoader } from './components/LoadingSpinner.jsx'

const App = () => {
  return (
    <div className='App'>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Join/>}/>
            <Route path="/request" element={<SimpleRequest/>}/>
            <Route path="/chat" element={<Chat/>}/>
          </Routes>
        </Suspense>
      </Router>
    </div>
  )
}

export default App
