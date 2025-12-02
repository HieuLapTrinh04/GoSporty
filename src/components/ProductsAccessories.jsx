import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";

export default function ProductsAccessories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products", {
          params: { category: "ACCESSORIES", limit: 12 },
        });
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-2 text-gray-800 text-center">
          Phụ kiện thể thao
        </h1>
        <div className="w-24 h-1 bg-gray-800 mx-auto mb-8 rounded-full" />

        {loading ? (
          <div className="text-center py-20">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="text-center col-span-4 text-gray-500">
                Không tìm thấy phụ kiện.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
