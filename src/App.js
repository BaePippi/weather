import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Location from "./components/Location.js";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/weather" element={<Location />} />
        <Route path="/" element={<Location />} />
      </Routes>
    </Router>
    // <div className="App">
    //   <Location />
    // </div>
  );
}

export default App;
