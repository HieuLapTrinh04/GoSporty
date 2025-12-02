import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const emptyProduct = {
    name: "",
    price: 0,
    originalPrice: 0,
    stock: 0,
    discount: 0,
    category: "",
    description: "",
    image: "",
    slug: "",
    rating: 5, // ✅ Mặc định 5 sao
    reviewCount: 0, // ✅ Số lượt đánh giá
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:10000/api/products?limit=9999");
      const data = await response.json();
      console.log("✅ Products:", data);
      setProducts(data.products || []);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleAdd = () => {
    setSelectedProduct({ ...emptyProduct });
    setShowAddModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct({ ...product });
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const addProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Auto generate slug from name
      const slug = selectedProduct.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const productData = {
        ...selectedProduct,
        slug: slug,
        price: parseInt(selectedProduct.price),
        originalPrice: parseInt(selectedProduct.originalPrice),
        stock: parseInt(selectedProduct.stock),
        discount: parseInt(selectedProduct.discount),
        rating: parseFloat(selectedProduct.rating) || 5, // ✅ Thêm rating
        reviewCount: parseInt(selectedProduct.reviewCount) || 0, // ✅ Thêm reviewCount
      };

      const response = await fetch("http://localhost:10000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        console.log("✅ Product added");
        fetchProducts();
        setShowAddModal(false);
        alert("Thêm sản phẩm thành công!");
      } else {
        const error = await response.json();
        alert(`Thêm sản phẩm thất bại: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Add error:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const saveProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:10000/api/admin/products/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedProduct),
        }
      );

      if (response.ok) {
        console.log("✅ Product updated");
        fetchProducts();
        setShowEditModal(false);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        alert("Cập nhật sản phẩm thất bại!");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:10000/api/admin/products/${selectedProduct._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("✅ Product deleted");
        fetchProducts();
        setShowDeleteModal(false);
        alert("Xóa sản phẩm thành công!");
      } else {
        alert("Xóa sản phẩm thất bại!");
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const categories = ["all", "GYM_YOGA", "TENNIS", "BADMINTON", "FOOTBALL", "BASKETBALL", "ACCESSORIES", "SWIMMING"];

  // ✅ Component hiển thị sao đánh giá
  const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 fill-gray-300" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  const ProductForm = ({ product, onChange }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sản phẩm *</label>
        <input
          type="text"
          value={product.name || ""}
          onChange={(e) => onChange({ ...product, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tên sản phẩm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán *</label>
          <input
            type="number"
            value={product.price || 0}
            onChange={(e) => onChange({ ...product, price: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Giá gốc</label>
          <input
            type="number"
            value={product.originalPrice || 0}
            onChange={(e) => onChange({ ...product, originalPrice: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng *</label>
          <input
            type="number"
            value={product.stock || 0}
            onChange={(e) => onChange({ ...product, stock: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Giảm giá (%)</label>
          <input
            type="number"
            value={product.discount || 0}
            onChange={(e) => onChange({ ...product, discount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* ✅ THÊM MỚI: Rating và Review Count */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Đánh giá (1-5 sao) *
          </label>
          <input
            type="number"
            value={product.rating || 5}
            onChange={(e) => {
              const value = Math.min(5, Math.max(1, parseFloat(e.target.value)));
              onChange({ ...product, rating: value });
            }}
            min="1"
            max="5"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5.0"
          />
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.rating || 5} />
            <span className="text-xs text-gray-500">({product.rating || 5})</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Số lượt đánh giá
          </label>
          <input
            type="number"
            value={product.reviewCount || 0}
            onChange={(e) => onChange({ ...product, reviewCount: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            Hiển thị: ⭐⭐⭐⭐⭐ ({product.reviewCount || 0})
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục *</label>
        <select
          value={product.category || ""}
          onChange={(e) => onChange({ ...product, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.filter(c => c !== "all").map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
        <textarea
          value={product.description || ""}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Nhập mô tả sản phẩm"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">URL Hình ảnh *</label>
        <input
          type="text"
          value={product.image || ""}
          onChange={(e) => onChange({ ...product, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
        {product.image && (
          <img 
            src={product.image} 
            alt="Preview" 
            className="mt-2 w-32 h-32 object-cover rounded border"
            onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
          />
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-1">Tổng số: {products.length} sản phẩm</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm sản phẩm
            </button>
            <Link
              to="/admin"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
            >
              ← Quay lại Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  categoryFilter === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat === "all" ? "Tất cả" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <div className="relative h-48 bg-gray-100">
              <img
                src={product.image || "https://via.placeholder.com/300"}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300";
                }}
              />
              {product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}%
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 h-12">
                {product.name}
              </h3>

              {/* ✅ Hiển thị rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount || 0})
                  </span>
                </div>
              )}

              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Kho: {product.stock || 0}</span>
                <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Products */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-green-600">Thêm sản phẩm mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <ProductForm product={selectedProduct} onChange={setSelectedProduct} />
              
              <div className="flex gap-4 pt-6">
                <button
                  onClick={addProduct}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Thêm sản phẩm
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <ProductForm product={selectedProduct} onChange={setSelectedProduct} />
              
              <div className="flex gap-4 pt-6">
                <button
                  onClick={saveProduct}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct.name}</strong>? 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;