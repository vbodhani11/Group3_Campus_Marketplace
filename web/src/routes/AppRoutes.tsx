import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Signup from "../pages/Signup";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <nav className="flex justify-center gap-6 p-4 bg-gray-100 shadow">
        <Link className="text-blue-600 font-semibold hover:underline" to="/">
          Home
        </Link>
        <Link className="text-blue-600 font-semibold hover:underline" to="/about">
          About
        </Link>
        <Link className="text-blue-600 font-semibold hover:underline" to="/signup">
          Signup
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
