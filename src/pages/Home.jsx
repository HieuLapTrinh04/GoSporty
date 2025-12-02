import React, { useEffect, useState } from "react";
import api from "../services/api";
import FeaturedCarousel from "../components/FeaturedCarousel";
import Navbar from "../components/Navbar";
import BannerSlider from "../components/BannerSlider";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import ProductsNew from "../components/ProductsNew";
import ProductsAccessories from "../components/ProductsAccessories";


const Home = () => {
  const [products, setProducts] = useState([]);
  const categories = [
    {
      image:
        "https://go-sporty.monamedia.net/wp-content/uploads/2025/04/camp-small-web-21.webp",
    },
    {
      image:
        "https://go-sporty.monamedia.net/wp-content/uploads/2025/04/camp-small-web-18-e1745203723162.webp",
    },
    {
      image:
        "https://go-sporty.monamedia.net/wp-content/uploads/2025/04/camp-small-web-6.webp",
    },
  ];
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get("/products");
      console.log("API PRODUCTS:", res.data);
      setProducts(res.data?.products || []); // tránh null
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      <main className="flex-grow">
        <BannerSlider />

        <section className="max-w-7xl mx-auto px-4 pt-14 pb-10 cursor-pointer">
          {products?.length > 0 ? (
            <FeaturedCarousel products={products.slice(0, 10)} />
          ) : (
            <p className="text-center text-gray-500">No products found.</p>
          )}
        </section>

        <section className="w-full py-10 pt-2">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Box 1 */}
            <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-4 px-6 rounded-lg shadow-md cursor-pointer ">
              <img
                src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/ser_1.png"
                className="w-8 h-8 filter brightness-0 invert"
                alt=""
              />

              <div>
                <p className="font-semibold">Vận chuyển siêu tốc</p>
                <p className="text-sm">Khu vực toàn quốc</p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="flex items-center gap-3 justify-center bg-gradient-to-r from-blue-700 to-blue-500 text-white py-4 px-6 rounded-lg shadow-md cursor-pointer ">
              <img
                src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/ser_2-1000x999.png"
                className="w-8 h-8 filter brightness-0 invert"
                alt=""
              />

              <div>
                <p className="font-semibold">Đổi trả dễ dàng</p>
                <p className="text-sm">Trong vòng 7 ngày</p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="flex items-center gap-3 justify-center bg-gradient-to-r from-blue-700 to-blue-500 text-white py-4 px-6 rounded-lg shadow-md cursor-pointer ">
              <img
                src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/ser_3.webp"
                className="w-8 h-8 filter brightness-0 invert"
                alt=""
              />

              <div>
                <p className="font-semibold">Thanh toán linh hoạt</p>
                <p className="text-sm">Nhiều phương thức an toàn</p>
              </div>
            
            </div>

            {/* Box 4 */}
            <div className="flex items-center gap-3 justify-center bg-gradient-to-r from-blue-700 to-blue-500 text-white py-4 px-6 rounded-lg shadow-md cursor-pointer">
              <img
                src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/ser_4.webp"
                className="w-8 h-8 filter brightness-0 invert"
                alt=""
              />
              <div>
                <p className="font-semibold">Hỗ trợ 24/7</p>
                <p className="text-sm">Tư vấn mọi lúc</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto py-5 ">
          <Link to="/products">
            <img
              src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/banner-main-2.png"
              alt=""
              className="w-auto h-auto rounded-xl"
            />
          </Link>
        </div>
        <section className="max-w-7xl mx-auto px-4 pt-14 pb-4 cursor-pointer">
          <h1 className="text-3xl font-semibold mb-2 text-gray-800 text-center">
            SẢN PHẨM MỚI NHẤT
          </h1>
          <div className="w-20 h-1 bg-gray-900 mx-auto mb-8 rounded-full font-bold" />
          {products.length > 0 ? (
            <ProductsNew products={products.slice(0, 10)} />
          ) : (
            <p className="text-center text-gray-500">No products found.</p>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-7xl mx-auto">
          {categories.map((item, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden h-44 cursor-pointer group"
            >
              <Link to="/products">
                <img
                  src={item.image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
              </Link>
            </div>
          ))}
        </div>
        <ProductsAccessories />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
