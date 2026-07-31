import React from 'react'
import gif from '../assets/af7b6ee82ae6de2df640d6d40c8fe8a4.gif'
const Loader = () => {
  return (
    <div className='flex items-center gap-2'>
      <div className='h-7 w-8 object-contain rounded-full overflow-hidden'>
        <img src={gif} alt="" className='h-full w-full scale-150' />
      </div>

    </div>
  )
}

export default Loader