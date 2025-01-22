import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import './App.css'
import Listing from './Components/Listing'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>REACH</h1>} />
        <Route 
          path="/listings"
          element={<Listing />}
        />
      </Routes>
    </Router>
  )
}

export default App
