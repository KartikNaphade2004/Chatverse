import React from 'react'

const Message = ({user , message , classs}) => {
 
    if(user){                  
        return (
        <div className={`bg-[#DCDCDC] max-w-fit text-xl max-md:text-2xl p-2 m-[1.5vmax] rounded-lg ${classs === 'right' ? 'ml-auto text-right ' : ''}`}>{`${user} : ${message}`}</div>
        )
    }
    else{
        return (
            <div className={`bg-[#DCDCDC] max-w-fit text-2xl p-2 m-[1vmax] rounded-lg  ${classs === 'right' ? 'ml-auto text-right' : ''}`}>{`You : ${message}`}</div>
        )
    }
    
  
}

export default Message