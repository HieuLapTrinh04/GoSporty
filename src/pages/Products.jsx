import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api"; // your axios instance
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { debounce } from "lodash";

const CATEGORIES = [
  { key: "SPORT_FASHION", label: "Thời trang thể thao" },
  { key: "GYM_YOGA", label: "Gym & Yoga" },
  { key: "RUNNING", label: "Chạy bộ" },
  { key: "FOOTBALL", label: "Bóng đá" },
  { key: "SWIMMING", label: "Bơi lội" },
  { key: "BADMINTON", label: "Cầu lông" },
  { key: "TENNIS", label: "Tennis" },
  { key: "VOLLEYBALL", label: "Bóng chuyền" },
  { key: "BASKETBALL", label: "Bóng rổ" },
  { key: "ACCESSORIES", label: "Phụ kiện" },
  { key: "TRAINING_EQUIPMENT", label: "Dụng cụ" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const params = {
          page: p,
          limit,
          sort,
        };
        if (category) params.category = category;
        if (subcategory) params.subcategory = subcategory;
        if (search) params.search = search;

        const res = await api.get("/products", { params });
        setProducts(res.data?.products || []);
        setPage(res.data?.page || 1);
        setPages(res.data?.pages || 1);
        setTotal(res.data?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [category, subcategory, sort, search, limit]
  );

  // debounce search input
  const debouncedSearch = useCallback(
    debounce((val) => {
      setPage(1);
      fetchProducts(1);
    }, 500),
    [fetchProducts]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  useEffect(() => {
    debouncedSearch(search);
    return () => debouncedSearch.cancel();
  }, [search, debouncedSearch]);

  // when category or sort changes, fetch page 1
  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [category, subcategory, sort, fetchProducts]);

  return (
    <>
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 hidden lg:block">
            <div className="bg-white p-4 rounded shadow">
              <h4 className="font-semibold mb-3">Danh mục</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCategory("")}
                    className={`w-full text-left p-2 rounded ${
                      category === ""
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Tất cả
                  </button>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat.key}>
                    <button
                      onClick={() => setCategory(cat.key)}
                      className={`w-full text-left p-2 rounded ${
                        category === cat.key
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border p-2 rounded w-full md:w-72"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: thấp → cao</option>
                  <option value="price_desc">Giá: cao → thấp</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Tổng: {total}</span>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="text-center py-20">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
              >
                &#60;
              </button>
              <span className="px-3 py-2">
                Page {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
              >
                &#62;
              </button>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
