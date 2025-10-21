import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-gray-300 pb-6 pt-16 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">GoSporty</h2>
          <p className="text-sm">
            Your one-stop shop for sportswear, accessories, and premium fitness gear.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-white">Products</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li>Shipping & Returns</li>
            <li>FAQs</li>
            <li>Support</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
          <p className="text-sm mb-3">Get updates on new arrivals & offers.</p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 rounded-l bg-white text-gray-900 border border-gray-700 text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 px-4 py-2 text-white text-sm rounded-r hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
        © {new Date().getFullYear()} GoSporty. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
