import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import { CartContext } from "../context/CartContext";

const API_URL = process.env.REACT_APP_API_URL;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching product with ID:", id);
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      console.log("Product response:", response.data);
      
      setProduct(response.data);
      
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      
      // Fetch related products
      fetchRelatedProducts(response.data._id);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.response?.data?.error || "Không thể tải sản phẩm");
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (productId) => {
    try {
      if (!productId) {
        console.warn("No product ID provided for fetching related products");
        return;
      }
      const response = await axios.get(`${API_URL}/api/products/${productId}/related`);
      setRelatedProducts(response.data);
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleAddToCart = (productToAdd = null) => {
    // Nếu có productToAdd (từ related products), xử lý riêng
    if (productToAdd) {
      const payload = {
        productId: productToAdd._id,
        qty: 1,
        selectedColor: productToAdd.colors?.[0] || "Mặc định",
        selectedSize: productToAdd.sizes?.[0] || "One Size",
        price: productToAdd.price,
        name: productToAdd.name,
        image: productToAdd.image || productToAdd.images?.[0],
      };
      
      console.log("🛒 Payload to add cart (related product):", payload);
      addToCart(payload);
      toast.success("✅ Đã thêm vào giỏ hàng!");
      return;
    }

    // Xử lý cho sản phẩm chính
    if (!product) return;

    const payload = {
      productId: product._id,
      qty: quantity,
      selectedColor: selectedColor || "Mặc định",
      selectedSize: selectedSize || "One Size",
      price: product.price,
      name: product.name,
      image: product.image || product.images?.[0],
    };

    console.log("🛒 Payload to add cart (main product):", payload);
    addToCart(payload);
    toast.success("✅ Đã thêm vào giỏ hàng!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-6">{error || "Sản phẩm này có thể đã bị xóa hoặc không tồn tại"}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const defaultImage = "https://via.placeholder.com/400x400?text=No+Image";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 relative">
                <img
                  src={images[selectedImage] || defaultImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                  onError={(e) => { e.target.src = defaultImage; }}
                />
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    -{product.discount}%
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
                        selectedImage === index ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img || defaultImage}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => { e.target.src = defaultImage; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Brand & Stock Status */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                  {product.brand || product.category || "GOSPORTY"}
                </p>
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                    ✓ Còn hàng
                  </span>
                ) : (
                  <span className="text-sm text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full">
                    Hết hàng
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating || 5.0} ({product.reviewCount || 120} đánh giá)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-b py-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-red-600">
                    {formatPrice(product.price)}₫
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}₫
                    </span>
                  )}
                </div>
                {product.discount > 0 && product.originalPrice && (
                  <span className="inline-block mt-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Tiết kiệm {formatPrice(product.originalPrice - product.price)}₫
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Màu sắc: <span className="font-normal text-blue-600">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2 rounded-lg border-2 transition-all font-medium ${
                          selectedColor === color
                            ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md'
                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Kích thước: <span className="font-normal text-blue-600">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2 rounded-lg border-2 transition-all font-medium ${
                          selectedSize === size
                            ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md'
                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">Số lượng:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-5 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(product.stock, val)));
                      }}
                      className="w-20 text-center border-l border-r border-gray-300 py-3 focus:outline-none font-semibold text-lg"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-5 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock} sản phẩm có sẵn
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleAddToCart()}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Thêm vào giỏ hàng
                </button>
                <button className="px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Policies */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-semibold text-sm">Miễn phí vận chuyển</p>
                  <p className="text-xs text-gray-500">Đơn từ 500k</p>
                </div>
                <div className="text-center">
                  <svg className="w-10 h-10 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="font-semibold text-sm">Đổi trả dễ dàng</p>
                  <p className="text-xs text-gray-500">Trong 30 ngày</p>
                </div>
                <div className="text-center">
                  <svg className="w-10 h-10 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-sm">Thanh toán an toàn</p>
                  <p className="text-xs text-gray-500">100% bảo mật</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section - Features & Reviews */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-8 py-4 text-sm font-semibold transition-colors ${
                  activeTab === "description"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-8 py-4 text-sm font-semibold transition-colors ${
                  activeTab === "specs"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Thông số
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "description" && (
              <div className="space-y-6">
                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Đặc điểm nổi bật</h3>
                    <ul className="space-y-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700 w-1/3">Thương hiệu</td>
                      <td className="py-3 px-4 text-gray-600">{product.brand || "GOSPORTY"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">Danh mục</td>
                      <td className="py-3 px-4 text-gray-600">{product.category}</td>
                    </tr>
                    {product.subcategory && (
                      <tr>
                        <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">Loại sản phẩm</td>
                        <td className="py-3 px-4 text-gray-600">{product.subcategory}</td>
                      </tr>
                    )}
                    {product.colors && product.colors.length > 0 && (
                      <tr>
                        <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">Màu sắc</td>
                        <td className="py-3 px-4 text-gray-600">{product.colors.join(", ")}</td>
                      </tr>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <tr>
                        <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">Kích thước</td>
                        <td className="py-3 px-4 text-gray-600">{product.sizes.join(", ")}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 px-4 bg-gray-50 font-semibold text-gray-700">Tình trạng</td>
                      <td className="py-3 px-4 text-gray-600">
                        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;