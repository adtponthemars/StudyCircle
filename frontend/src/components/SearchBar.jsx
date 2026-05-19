import React from 'react'
import { Search } from 'lucide-react'
const SearchBar = ({value, setFunction}) => {
  return (
    <div className='flex justify-between py-3 px-4 min-w-96 w-140 bg-white text-gray-900 rounded-sm'>
        <input type="text" placeholder='Search study resources' value={value} onChange={(e) => setFunction(e.target.value)}/>
        <Search/>
    </div>
  )
}

export default SearchBar