import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import './App.css'
import Listing from './Components/Listing'
import Register from './Components/Register'
import Login from './Components/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>REACH</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/listings"
          element={<Listing />}
        />
      </Routes>
    </Router>
  )
}

export default App
