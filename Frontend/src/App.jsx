import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import './App.css'
import Listing from './Components/Listing'
import Register from './Components/Register'
import Login from './Components/Login'
import User from './Components/User'
import Landing from './Components/Landing'
import { AuthProvider } from './Components/services/AuthProvider'

function App() {
  const [count, setCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<User />} />
        <Route 
          path="/listings"
          element={<Listing />}
        />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
