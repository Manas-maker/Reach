import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import './App.css'
import Reviews from './Components/Reviews'
import CreateReview from './Components/CreateReview'
import {ViewCategories, ViewListing} from './Components/Listing'
import SearchResults from './Components/SearchResults'
import ListingForm from './Components/ListingForm'
import SuccessPage from './Components/SuccessPage'
import BookmarkList from "./Components/BookmarkList"
import BookmarkCard from "./Components/BookmarkCard"


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>REACH</h1>} />
        <Route path="/reviews/:listingid" element={<Reviews />}/>
        <Route path="/create-review/:listingid" element={<CreateReview />}/>
        <Route path="/search/:type" element={<ViewCategories/>}/>
        <Route path="/listing/:id" element={<ViewListing/>}/>
        <Route path="/search" element={<SearchResults/>}/>
        <Route path="/newListing" element={<ListingForm/>}/>
        <Route path="/success" element={<SuccessPage/>}/>
        <Route path="/bookmarks/:id" element={<BookmarkList/>}/>
        <Route path="/:id/bookmarks" element={<BookmarkCard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
