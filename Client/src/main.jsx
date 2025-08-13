import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
   
       <App />,
       {/* wrapping the app component inside  provider so that all the components used in app and the app component itself should be able to access the store */}  
)
