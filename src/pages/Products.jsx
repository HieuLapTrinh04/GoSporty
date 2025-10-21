// src/pages/ProductsPage.jsx
import { useState, useEffect } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard"; // dùng lại card đã làm
import Navbar from "../components/Navbar";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div>
      <Navbar />
    <div className="container mx-auto px-4 py-6">
      {/* --- Bộ lọc & tìm kiếm --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-14">
        {/* Search */}
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sắp xếp</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>
      </div>

      {/* --- Danh sách sản phẩm --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sorted.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
    </div>
  );
};

export default ProductsPage;
