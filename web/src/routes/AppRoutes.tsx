import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";

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
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
