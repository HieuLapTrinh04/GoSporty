import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const { cart } = useContext(CartContext);

  // Tính tổng số lượng
  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.qty, 0);
  };
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
          <li>
            <Link to="/" className="hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-blue-500">
              Products
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-blue-500">
              About
            </Link>
          </li>
          <li>
            <Link to="/blog" className="hover:text-blue-500">
              Blog
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-blue-500">
              Contact
            </Link>
          </li>
        </ul>

        {/* Icons */}
        <div className="hidden md:flex items-center space-x-6 text-xl">
          <Link to="/products" className="hover:text-blue-500">
            🔍
          </Link>
          <Link to="/cart" className="relative">
            <svg
              className="w-7 h-7 text-gray-700 hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            📦
          </Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="hover:text-blue-500">
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
            <li>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-500"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-500"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-500"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-500"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="hover:text-blue-500"
              >
                Contact
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button onClick={handleLogout}>👤Logout</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  👤Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
