import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Location from "./components/Location.js";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Location />} />
        <Route path="/hello" element={<p>Hello</p>} />
      </Routes>
    </Router>
    // <div className="App">
    //   <Location />
    // </div>
  );
}

export default App;
