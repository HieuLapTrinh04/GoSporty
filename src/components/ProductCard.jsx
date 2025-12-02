import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductQuickView from "./ProductQuickView";
import { toast } from "react-toastify";

const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const [showQuickView, setShowQuickView] = useState(false);

  if (!product) return null;

  // Lấy ID đúng format
  const productId = product._id?.$oid || product._id;
  
  const img = product.image || product.images?.[0] || "/no-image.png";
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    toast.success("✅ Đã thêm vào giỏ hàng!");
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Opening quick view for product:", productId);
    setShowQuickView(true);
  };

  return (
    <>
      <div className="group relative bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Product Image */}
        <Link to={`/product/${productId}`} className="block">
          <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
            <img
              src={img}
              alt={product.name || "Product"}
              className="w-full h-full object-contain p-4 transform transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{product.discount}%
              </div>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                {/* Quick View Button */}
                <button
                  onClick={handleQuickView}
                  className="bg-white shadow-lg p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-200"
                  title="Xem nhanh"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-lg"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-gray-400 uppercase text-xs mb-1 line-clamp-1">
            {product.category || "Phụ kiện thể thao"}
          </p>
          <Link to={`/product/${productId}`}>
            <h3 className="text-sm font-semibold hover:text-blue-600 transition-colors line-clamp-2 mb-2 h-10">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2">
            <p className="text-blue-600 font-bold text-lg">
              {formatPrice(product.price)}₫
            </p>
            {product.originalPrice && (
              <p className="text-gray-400 text-sm line-through">
                {formatPrice(product.originalPrice)}₫
              </p>
            )}
          </div>
          
          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < product.rating ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <ProductQuickView
          product={product}
          productId={productId}
          onClose={() => setShowQuickView(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard;

