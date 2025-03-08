import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import BookmarkList from "./Components/BookmarkList"
import BookmarkCard from "./Components/BookmarkCard"
import "./bookmark.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>REACH</h1>} />
        <Route path="/bookmarks/:id" element={<BookmarkList/>}/>
        <Route path="/:id/bookmarks" element={<BookmarkCard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
