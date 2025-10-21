import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">

        {/* Logo */}
        <Link to="/" className="text-3xl font-bold text-black tracking-wider">
          GoSporty
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 uppercase text-sm font-semibold">
          <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
          <li><Link to="/products" className="hover:text-blue-500">Products</Link></li>
          <li><Link to="/about" className="hover:text-blue-500">About</Link></li>
          <li><Link to="/blog" className="hover:text-blue-500">Blog</Link></li>
          <li><Link to="/contact" className="hover:text-blue-500">Contact</Link></li>
        </ul>

        {/* Icons */}
        <div className="hidden md:flex items-center space-x-6 text-xl">
          <Link to="/products" className="hover:text-blue-500">🔍</Link>
          <Link to="/cart" className="hover:text-blue-500">🛒</Link>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hover:text-blue-500"
            >
              👤 Logout
            </button>
          ) : (
            <Link to="/login" className="hover:text-blue-500">
              👤
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Collapse Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <ul className="flex flex-col items-center space-y-4 py-4 uppercase text-sm">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/men" onClick={() => setMenuOpen(false)}>Men</Link></li>
            <li><Link to="/women" onClick={() => setMenuOpen(false)}>Women</Link></li>
            <li><Link to="/accessories" onClick={() => setMenuOpen(false)}>Accessories</Link></li>
            <li><Link to="/sale" onClick={() => setMenuOpen(false)}>Sale</Link></li>
            <li><Link to="/blog" onClick={() => setMenuOpen(false)}>Blog</Link></li>
            <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout}>Logout</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
