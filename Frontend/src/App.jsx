import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { useState } from "react"
import './App.css'
import Register from './Components/Register'
import Login from './Components/Login'
import User from './Components/User'
import Landing from './Components/Landing'
import { AuthProvider } from './Components/services/AuthProvider'
import Reviews from './Components/Reviews'
import CreateReview from './Components/CreateReview'
import {ViewCategories, ViewListing} from './Components/Listing'
import SearchResults from './Components/SearchResults'
import ListingForm from './Components/ListingForm'
import SuccessPage from './Components/SuccessPage'
import BookmarkList from "./Components/BookmarkList"
import BookmarkCard from "./Components/BookmarkCard"


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
        <Route path="/reviews/:listingid" element={<Reviews />}/>
        <Route path="/create-review/:listingid" element={<CreateReview />}/>
        <Route path="/search/:type" element={<ViewCategories/>}/>
        <Route path="/listing/:id" element={<ViewListing/>}/>
        <Route path="/search" element={<SearchResults/>}/>
        <Route path="/newListing" element={<ListingForm/>}/>
        <Route path="/success" element={<SuccessPage/>}/>
        <Route path="/bookmarks/:id" element={<BookmarkList/>}/>
        <Route path="/bookmarks" element={<BookmarkCard/>}/>
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App;
