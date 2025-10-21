import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="w-full mt-16">
        <section
          className="w-full h-[500px] md:h-[800px] bg-cover bg-center flex items-center justify-start px-6 md:px-20 relative"
          style={{
            backgroundImage:
              "url('https://go-sporty.monamedia.net/wp-content/uploads/2025/03/ab_hero_image.jpeg')",
          }}
        >
          <div className="text-white max-w-4xl top-1/4 left-2/4 absolute">
            <p className="uppercase tracking-widget text-2xl mb-2">
              Khám phá bộ sưu tập đồ thể thao và phụ kiện chất lượng
            </p>
            <h1 className="text-3xl md:text-8xl font-bold md:leading-tight mb-24 mt-8">
              Nơi gửi gắm đam mê thể thao
            </h1>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-800 transition px-9 text-xl py-4 rounded-3xl text-white font-medium"
            >
              Liên hệ
            </Link>
          </div>
        </section>

        <section className="w-full py-16 px-6 md:px-20 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2">
            <img
              src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/11468-1000x1000.jpg"
              alt="Giới thiệu"
              className="w-full rounded-3xl shadow-lg"
            />
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-5xl font-bold mb-4">
              GIỚI THIỆU VỀ CHÚNG TÔI
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed md:text-xl">
              Sứ mệnh của chúng tôi là mang đến những chọn lựa phẩm chất tốt
              nhất, hỗ trợ bạn đạt được mục tiêu thể thao của mình. Chúng tôi
              cam kết cung cấp dịch vụ khách hàng tận tình và sản phẩm chính
              hãng, giúp bạn có trải nghiệm mua sắm thông minh.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-white text-xl mr-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  ✔
                </span>
                <span className="text-xl">Chất lượng sản phẩm</span>
              </li>
              <li className="flex items-center">
                <span className="text-white text-xl mr-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  ✔
                </span>
                <span className="text-xl">Đa dạng lựa chọn</span>
              </li>
              <li className="flex items-center">
                <span className="text-white text-xl mr-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  ✔
                </span>
                <span className="text-xl">Khuyến mãi hấp dẫn</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="relative w-full h-[350px] md:h-[500px] my-16">
          <img
            src="https://go-sporty.monamedia.net/wp-content/uploads/2025/03/m1_hockey_bg.jpeg"
            alt="Banner CTA"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex flex-col justify-center items-end px-8 md:px-24">
            <h1 className="text-white text-xl mr-32 md:text-2xl mb-2 uppercase">
              Khám Phá Bộ Sưu Tập Độc Đáo
            </h1>
            <h3 className="text-white text-2xl md:text-6xl font-bold max-w-2xl leading-snug mb-4 text-center">
              Hãy bắt đầu hành trình thể thao của bạn ngay hôm nay!
            </h3>
            <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition mr-64 mt-4">
              Mua ngay
            </Link>
          </div>
        </section>

        {/* Section 4 - FAQ */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 my-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Cột FAQ */}
          <div>
            <h3 className="text-4xl font-bold mb-6">
              CÂU HỎI THƯỜNG GẶP (FAQS)
            </h3>
            <p className="text-gray-600 text-xl mb-6">
              Chúng tôi hiểu rằng bạn có thể có nhiều câu hỏi khi mua sắm sản
              phẩm thể thao. Dưới đây là những thắc mắc phổ biến và câu trả lời
              tương ứng để giúp bạn yên tâm.
            </p>

            <details className="mb-4 border rounded-lg p-4 group">
              <summary
                className="font-semibold text-lg cursor-pointer hover:text-blue-800 transition-colors 
    group-open:text-blue-600"
              >
                Tôi có thể trả hàng nếu không hài lòng với sản phẩm không?
              </summary>
              <p className="text-gray-600 text-lg mt-2">
                Tất nhiên! Bạn có thể đổi hoặc trả hàng trong vòng 7 ngày nếu
                sản phẩm lỗi, không đúng mô tả hoặc không vừa ý.
              </p>
            </details>

            {/* Accordion 2 */}
            <details className="mb-4 border rounded-lg p-4 group">
              <summary
                className="font-semibold text-lg cursor-pointer hover:text-blue-800 transition-colors 
    group-open:text-blue-600"
              >
                Các phương thức thanh toán nào được chấp nhận?
              </summary>
              <p className="text-gray-600 text-lg mt-2">
                Chúng tôi hỗ trợ thanh toán qua thẻ ngân hàng, ví điện tử và
                COD.
              </p>
            </details>

            {/* Accordion 3 */}
            <details className="mb-4 border rounded-lg p-4 group">
              <summary
                className="font-semibold text-lg cursor-pointer hover:text-blue-800 transition-colors 
    group-open:text-blue-600"
              >
                Thời gian giao hàng là bao lâu?
              </summary>
              <p className="text-gray-600 text-lg mt-2">
                Thời gian giao hàng từ 3–5 ngày tùy khu vực.
              </p>
            </details>
          </div>

          {/* Cột ảnh */}
          <div className="flex justify-center">
            <img
              src="https://go-sporty.monamedia.net/wp-content/uploads/2025/04/1989-1024x1024.jpg"
              alt="FAQ Illustration"
              className="w-full max-w-xl rounded-xl shadow-lg object-cover"
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;
