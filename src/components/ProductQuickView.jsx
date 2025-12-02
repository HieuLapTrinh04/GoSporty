import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import ReactDOM from "react-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ProductQuickView = ({
  product,
  productId: propProductId,
  onClose,
  onAddToCart,
}) => {
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const productId = propProductId || product._id?.$oid || product._id;

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching product detail for ID:", productId);
      const response = await axios.get(`${API_URL}/api/products/${productId}`);

      console.log("✅ Product detail response:", response.data);

      setProductDetail(response.data);

      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching product detail:", error);
      console.error("Error response:", error.response?.data);
      setError(
        error.response?.data?.error || "Không thể tải thông tin sản phẩm"
      );

      // Fallback to using the product prop
      setProductDetail(product);
      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      setLoading(false);
    }
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

const { addToCart } = useContext(CartContext);

const handleAddToCart = () => {
  if (!productDetail) return;

  const payload = {
    productId: productDetail._id,
    qty: quantity,
    selectedColor: selectedColor || "Mặc định",
    selectedSize: selectedSize || "One Size",
    price: productDetail.price,
    name: productDetail.name,
    image: productDetail.image || productDetail.images?.[0],
  };

  console.log("🛒 Payload to add cart:", payload);

  addToCart(payload);
  toast.success("✅ Đã thêm vào giỏ hàng!");
  
  // Đóng modal sau 1s
  setTimeout(() => {
    onClose();
  }, 1000);
};



  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error && !productDetail) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-8 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Lỗi tải sản phẩm
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images =
    productDetail?.images && productDetail.images.length > 0
      ? productDetail.images
      : [productDetail?.image || product.image];
  const defaultImage = "https://via.placeholder.com/400x400?text=No+Image";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
            <p className="text-sm text-yellow-700">⚠️ {error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 relative">
              <img
                src={images[selectedImage] || defaultImage}
                alt={productDetail?.name}
                className="w-full h-full object-contain p-6"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
              {productDetail?.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  -{productDetail.discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-600 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img || defaultImage}
                      alt={`${productDetail?.name} ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.src = defaultImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Brand & Category */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {productDetail?.brand || productDetail?.category || "GOSPORTY"}
              </p>
              {productDetail?.stock > 0 ? (
                <span className="text-sm text-green-600 font-semibold">
                  ✓ Còn hàng
                </span>
              ) : (
                <span className="text-sm text-red-600 font-semibold">
                  Hết hàng
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {productDetail?.name}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(productDetail?.rating || 5)
                          ? "fill-current"
                          : "fill-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({productDetail?.reviewCount || 120} đánh giá)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(productDetail?.price)}₫
                </span>
                {productDetail?.originalPrice &&
                  productDetail.originalPrice > productDetail.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(productDetail.originalPrice)}₫
                    </span>
                  )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-600 leading-relaxed">
                {productDetail?.description}
              </p>
            </div>

            {/* Features */}
            {productDetail?.features && productDetail.features.length > 0 && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Đặc điểm nổi bật
                </h3>
                <ul className="space-y-2">
                  {productDetail.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color Selection */}
            {productDetail?.colors && productDetail.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Màu sắc:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {productDetail.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {productDetail?.sizes && productDetail.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Kích thước:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedSize}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {productDetail.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md"
                          : "border-gray-200 hover:border-gray-400 text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Số lượng:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
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
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(
                            productDetail?.stock || 100,
                            parseInt(e.target.value) || 1
                          )
                        )
                      )
                    }
                    className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none"
                    min="1"
                    max={productDetail?.stock || 100}
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(productDetail?.stock || 100, quantity + 1)
                      )
                    }
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= (productDetail?.stock || 100)}
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
                <span className="text-sm text-gray-500">
                  Còn {productDetail?.stock || 100} sản phẩm
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                // onClick={() => handleAddToCart()}
                onClick={handleAddToCart}
                disabled={productDetail?.stock <= 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
              >
                <svg
                  className="w-5 h-5"
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
                Thêm vào giỏ hàng
              </button>
              <Link
                to={`/product/${product._id}`}
                onClick={onClose}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center flex items-center"
              >
                Xem chi tiết
              </Link>
            </div>

            {/* Policies */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-sm">Giao hàng hỏa tốc</p>
                  <p className="text-xs text-gray-500">Trong 2 giờ</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-blue-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-sm">Đổi trả miễn phí</p>
                  <p className="text-xs text-gray-500">Trong 30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body 
  );
};

export default ProductQuickView;
