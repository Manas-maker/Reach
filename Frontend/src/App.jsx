import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import './App.css'
import {ViewCategories, ViewListing} from './Components/Listing'
import SearchResults from './Components/SearchResults'
import ListingForm from './Components/ListingForm'
import SuccessPage from './Components/SuccessPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>REACH</h1>} />
        <Route path="/search/:type" element={<ViewCategories/>}/>
        <Route path="/listing/:id" element={<ViewListing/>}/>
        <Route path="/search" element={<SearchResults/>}/>
        <Route path="/newListing" element={<ListingForm/>}/>
        <Route path="/success" element={<SuccessPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
