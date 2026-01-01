// src/components/layout/Navbar.jsx
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="p-6 border-b border-white/10 bg-[#005F50]">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ObjectDetect AI</h1>
            <p className="text-xs text-gray-400">Algorithm Comparison Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6">
          <a href="#about" className="text-gray-300 hover:text-white transition">
            About
          </a>
          <a href="#features" className="text-gray-300 hover:text-white transition">
            Features
          </a>
          <a href="#docs" className="text-gray-300 hover:text-white transition">
            Docs
          </a>
        </nav>

        {/* Mobile Menu Button (Optional) */}
        <button className="md:hidden text-gray-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
