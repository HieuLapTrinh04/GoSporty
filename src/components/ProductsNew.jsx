import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "./ProductCard";

const ProductsNew = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        const productArray =
          res.data.products || res.data.data || res.data; // Ưu tiên đúng field

        if (Array.isArray(productArray)) {
          const sortedProducts = [...productArray].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setProducts(sortedProducts);
        } else {
          console.error("API không trả về mảng:", res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false)); // ✅ tắt loading
  }, []);

  const displayProducts = products.slice(0, 12);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductsNew;
