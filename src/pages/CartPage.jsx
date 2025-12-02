import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CartPage = () => {
  const { cart, addToCart, updateQuantity, removeItem, clearCartLocal } = useContext(CartContext);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price || 0) * (item.qty || 0);
    }, 0);
  };

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + (item.qty || 0), 0);
  };

  // ✅ FIX: Xóa item
  const handleRemoveItem = (item) => {
    removeItem(item.productId, item.selectedColor, item.selectedSize);
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
  };

  // ✅ FIX: Update số lượng
  const handleUpdateQuantity = (item, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(item);
      return;
    }

    updateQuantity(item.productId, item.selectedColor, item.selectedSize, newQty);
    toast.success("Đã cập nhật số lượng!");
  };

  // Clear cart
  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCartLocal();
      toast.success("Đã xóa toàn bộ giỏ hàng!");
    }
  };


  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <svg
              className="w-32 h-32 text-gray-400 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl mx-auto px-4 pt-20 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
            <p className="text-gray-600 mt-1">
              {getTotalItems()} sản phẩm
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <div
                key={`${item.productId}-${item.selectedColor}-${item.selectedSize}-${index}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.productId}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-32 h-32 object-contain rounded-lg bg-gray-50"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="space-y-2 text-sm text-gray-600">
                      {item.selectedColor && (
                        <p>
                          <span className="font-medium">Màu sắc:</span>{" "}
                          {item.selectedColor}
                        </p>
                      )}
                      {item.selectedSize && (
                        <p>
                          <span className="font-medium">Kích thước:</span>{" "}
                          {item.selectedSize}
                        </p>
                      )}
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(item.price)}₫
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item, item.qty - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="px-4 py-1 font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.qty + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Xóa
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Tạm tính:{" "}
                        <span className="font-bold text-gray-900">
                          {formatPrice((item.price || 0) * (item.qty || 0))}₫
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({getTotalItems()} sản phẩm)</span>
                  <span className="font-semibold">
                    {formatPrice(calculateTotal())}₫
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(calculateTotal())}₫
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Thanh toán
              </button>

              <Link
                to="/products"
                className="block w-full text-center mt-4 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Miễn phí vận chuyển cho đơn từ 500k</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Đổi trả trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span>Thanh toán an toàn 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;