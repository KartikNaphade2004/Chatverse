import React , {useState} from 'react'
import './Join.css'
import logo from '../../images/logo.png'
import {Link} from 'react-router-dom'

const Join = () => {
   const [username , setUsername] = useState(""); 
   const sendUser = () =>{
    sessionStorage.setItem("user", username);
      setUsername("");
    }
  return (
    <div className='JoinPage flex items-center justify-center'>
      <div className="JoinContainer max-md:w-[100%] w-1/2 h-1/2 border-2 border-white flex-col">
         
         <div className='flex items-center justify-center mt-4'> 
          <img src={logo} className='w-[150px] h-[150px] mb-20 max-md:w-[30vw]'></img>
         <h1 className='text-white text-[2.5vmax] max-md:text-3xl border-b-4 -mt-20'>ChatVerse</h1>
         </div>
         <div className='flex flex-col items-center justify-center -mt-14'>

         <input
            type="text"
            className="bg-white w-[25vmax] p-[1.5vmax] max-md:w-[75vw] text-2xl  outline-none"
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}  id="username" // Ensure setUser is used correctly
          />

         <Link to={'/chat'}>
         <button className="w-[7vmax] p-[0.5vmax] text-[1.2vmax] bg-blue-500 hover:bg-blue-700 transition-all duration-300 cursor-pointer text-white rounded-lg mt-4 max-md:w-[35vw] max-md:h-[12vw] max-md:text-[2.5vmax]" onClick={(e)=>{if(!username){e.preventDefault()}else{sendUser()}}}>Join</button>
         </Link>
         </div>
         
      </div>
    </div>
  )
}

export default Join