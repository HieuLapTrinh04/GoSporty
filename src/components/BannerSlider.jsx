import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BannerSlider = () => {
  const slides = [
    {
      img: "https://go-sporty.monamedia.net/wp-content/uploads/2025/04/banner-main.png",
    },
    {
      img: "https://go-sporty.monamedia.net/wp-content/uploads/2025/04/banner-main-2.png",
    },
    {
      img: "https://go-sporty.monamedia.net/wp-content/uploads/2025/04/banner-main-3.png",
    },
  ];

  return (
    <div className="w-full aspect-[16/6] mt-16">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        loop={true}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        navigation
        className="w-full h-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            {/* <div
            className="w-full h-full bg-cover bg-center flex items-center justify-center text-white"
            style={{ backgroundImage: `url(${slide.img})` }}
          >
          </div> */}
            <img
              src={slide.img}
              alt={`slide-${i}`}
              className="w-full h-full object-cover object-center"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
