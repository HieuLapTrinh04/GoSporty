import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "./ProductCard";

const ProductsNew = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        const sortedProducts = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProducts(sortedProducts);
      })
      .catch((err) => console.error(err));
  }, []);

  const displayProducts = products.slice(0, 12);

  return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
  );
};

export default ProductsNew;
