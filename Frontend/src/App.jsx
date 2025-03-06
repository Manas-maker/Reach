import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import './App.css'
import Listing from './Components/Listing'
import Reviews from './Components/Reviews'
import CreateReview from './Components/CreateReview'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>REACH</h1>} />
        <Route 
          path="/listings"
          element={<Listing />}
        />
        <Route 
          path="/reviews/:listingid"
          element={<Reviews />}
        />
        <Route 
          path="/create-review/:listingid" 
          element={<CreateReview />} 
        />
      </Routes>
    </Router>
  )
}
export default App