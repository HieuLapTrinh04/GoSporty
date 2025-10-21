import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="group relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl border ">
      {/* Product Image */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full rounded-lg object-cover transform transition-transform duration-500 group-hover:scale-105 p-1"
        />

        {/* Hover Buttons */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
          {/* Nút Search */}
          <Link
            to={`/product/${product._id}`}
            className="translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                      transition-all duration-300 bg-white shadow-md p-3 rounded-full hover:bg-gray-200"
          >
            🔍
          </Link>

          {/* Nút Add to Cart */}
          <button
            className="translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                       transition-all duration-500 bg-[#0a4b9c] text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <p className="text-gray-400 uppercase text-xs">{product.description}</p>
        <h3 className="text-lg font-semibold hover:text-blue-600">{product.name}</h3>
        <p className="text-blue-600 font-bold">
          {product.price ? `$${product.price}` : "Contact"}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
