import React from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";

const FeaturedCarousel = ({ products }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 }},
      { breakpoint: 768, settings: { slidesToShow: 2 }},
      { breakpoint: 480, settings: { slidesToShow: 1 }},
    ],
  };

  return (
    <div className="max-w-10xl mx-auto px-4 py-10 pt-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
        Featured Products
      </h1>
      <Slider {...settings}>
        {products.map((p) => (
          <div key={p.id} className="px-2 pb-10">
            <ProductCard product={p} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedCarousel;
