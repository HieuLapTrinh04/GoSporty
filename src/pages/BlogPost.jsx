import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const BlogPost = () => {
  const { slug } = useParams();

  // Sample blog posts data (giống như trong Blog component)
  const blogPosts = [
    {
      id: 1,
      title: "10 Bài Tập Cardio Giúp Giảm Cân Hiệu Quả",
      slug: "10-bai-tap-cardio-giam-can",
      excerpt:
        "Khám phá 10 bài tập cardio đơn giản nhưng cực kỳ hiệu quả giúp bạn đốt cháy calo và giảm cân nhanh chóng tại nhà.",
      category: "Fitness",
      author: "Nguyễn Văn A",
      date: "15/11/2024",
      image:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
      readTime: "5 phút đọc",
      content: `
        <h2>Giới thiệu</h2>
        <p>Cardio là một trong những phương pháp tập luyện hiệu quả nhất để giảm cân và cải thiện sức khỏe tim mạch. Trong bài viết này, chúng tôi sẽ giới thiệu đến bạn 10 bài tập cardio đơn giản nhưng cực kỳ hiệu quả mà bạn có thể thực hiện tại nhà.</p>
        
        <h2>1. Jumping Jacks</h2>
        <p>Đây là bài tập khởi động tuyệt vời, giúp tăng nhịp tim và làm nóng cơ thể. Thực hiện 3 hiệp, mỗi hiệp 30 giây.</p>
        
        <h2>2. High Knees</h2>
        <p>Bài tập này giúp đốt cháy calo nhanh chóng và tăng cường sức mạnh cho đùi và bụng dưới.</p>
        
        <h2>3. Burpees</h2>
        <p>Burpees là bài tập toàn thân giúp tăng cường sức mạnh, sức bền và đốt cháy nhiều calo.</p>
        
        <h2>4. Mountain Climbers</h2>
        <p>Bài tập tuyệt vời cho cơ bụng, vai và tim mạch.</p>
        
        <h2>5. Jump Rope</h2>
        <p>Nhảy dây là bài tập cardio cổ điển, giúp đốt cháy đến 10-16 calo mỗi phút.</p>
        
        <h2>Kết luận</h2>
        <p>Thực hiện đều đặn những bài tập này sẽ giúp bạn giảm cân hiệu quả và cải thiện sức khỏe tổng thể. Hãy bắt đầu từ từ và tăng cường độ dần dần.</p>
      `,
    },
    {
      id: 2,
      title: "Hướng Dẫn Chọn Giày Chạy Bộ Phù Hợp",
      slug: "huong-dan-chon-giay-chay-bo",
      excerpt:
        "Tìm hiểu cách chọn đôi giày chạy bộ hoàn hảo dựa trên dáng bàn chân, phong cách chạy và địa hình tập luyện của bạn.",
      category: "Gear",
      author: "Trần Thị B",
      date: "12/11/2024",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      readTime: "7 phút đọc",
      content: `
        <h2>Tại sao giày chạy bộ quan trọng?</h2>
        <p>Chọn đúng giày chạy bộ không chỉ giúp bạn thoải mái hơn mà còn phòng tránh chấn thương và cải thiện hiệu suất chạy.</p>
        
        <h2>1. Xác định dáng bàn chân của bạn</h2>
        <p>Có 3 dáng bàn chân chính: bàn chân bình thường, bàn chân cao và bàn chân bẹt. Mỗi dáng chân cần một loại giày khác nhau.</p>
        
        <h2>2. Hiểu về phong cách chạy</h2>
        <p>Cách bàn chân tiếp đất (heel strike, midfoot, forefoot) ảnh hưởng đến việc chọn giày.</p>
        
        <h2>3. Địa hình tập luyện</h2>
        <p>Chạy trên đường phố, đường mòn hay máy chạy bộ đều cần loại giày khác nhau.</p>
        
        <h2>Kết luận</h2>
        <p>Đừng ngại đầu tư vào một đôi giày chất lượng. Đôi chân của bạn xứng đáng được bảo vệ tốt nhất!</p>
      `,
    },
    {
      id: 3,
      title: "Chế Độ Ăn Uống Cho Người Tập Gym",
      slug: "che-do-an-uong-cho-nguoi-tap-gym",
      excerpt:
        "Bí quyết xây dựng thực đơn dinh dưỡng cân đối giúp tăng cơ, giảm mỡ hiệu quả cho người tập gym.",
      category: "Nutrition",
      author: "Lê Văn C",
      date: "10/11/2024",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      readTime: "10 phút đọc",
      content: `
        <h2>Nguyên tắc dinh dưỡng cơ bản</h2>
        <p>Để tăng cơ hiệu quả, bạn cần đảm bảo cung cấp đủ protein, carbohydrate và chất béo lành mạnh.</p>
        
        <h2>Protein - Nền tảng xây dựng cơ bắp</h2>
        <p>Nên tiêu thụ 1.6-2.2g protein/kg cân nặng mỗi ngày. Nguồn protein tốt: thịt gà, cá, trứng, đậu phụ.</p>
        
        <h2>Carbohydrate - Nguồn năng lượng</h2>
        <p>Carbs phức tạp như gạo lứt, yến mạch, khoai lang giúp cung cấp năng lượng bền vững.</p>
        
        <h2>Chất béo lành mạnh</h2>
        <p>Omega-3 từ cá hồi, hạt chia, quả bơ rất tốt cho sức khỏe tim mạch và giảm viêm.</p>
        
        <h2>Thực đơn mẫu</h2>
        <p>Bữa sáng: Yến mạch + trứng + chuối<br/>
        Bữa trưa: Gạo lứt + thịt gà + rau xanh<br/>
        Bữa tối: Cá hồi + khoai lang + salad</p>
      `,
    },
    {
      id: 4,
      title: "Yoga Buổi Sáng - Khởi Đầu Ngày Đầy Năng Lượng",
      slug: "yoga-buoi-sang",
      excerpt:
        "15 phút yoga mỗi sáng giúp bạn thư giãn, tăng sự linh hoạt và tràn đầy năng lượng cho cả ngày dài.",
      category: "Yoga",
      author: "Phạm Thị D",
      date: "08/11/2024",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      readTime: "6 phút đọc",
      content: `
        <h2>Lợi ích của yoga buổi sáng</h2>
        <p>Tập yoga vào buổi sáng giúp đánh thức cơ thể, cải thiện tuần hoàn máu và tạo tinh thần tích cực cho cả ngày.</p>
        
        <h2>Chuẩn bị trước khi tập</h2>
        <p>Tìm một không gian yên tĩnh, chuẩn bị thảm yoga và uống một cốc nước ấm.</p>
        
        <h2>Các tư thế yoga buổi sáng</h2>
        <p><strong>1. Cat-Cow Pose:</strong> Giúp kéo giãn cột sống<br/>
        <strong>2. Downward Dog:</strong> Kéo giãn toàn thân<br/>
        <strong>3. Child's Pose:</strong> Thư giãn và nghỉ ngơi<br/>
        <strong>4. Sun Salutation:</strong> Bài tập tổng hợp năng lượng</p>
        
        <h2>Kết thúc với thiền định</h2>
        <p>Dành 5 phút cuối để ngồi thiền, tập trung vào hơi thở và cảm nhận năng lượng trong cơ thể.</p>
      `,
    },
    {
      id: 5,
      title: "Top 5 Dụng Cụ Tập Gym Tại Nhà Hiệu Quả",
      slug: "top-5-dung-cu-tap-gym-tai-nha",
      excerpt:
        "Khám phá 5 dụng cụ tập gym cơ bản nhất giúp bạn có thể tập luyện hiệu quả ngay tại nhà mà không cần đến phòng gym.",
      category: "Gear",
      author: "Hoàng Văn E",
      date: "05/11/2024",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
      readTime: "8 phút đọc",
      content: `
        <h2>Tập gym tại nhà - Xu hướng mới</h2>
        <p>Với những dụng cụ đơn giản, bạn hoàn toàn có thể xây dựng phòng gym mini tại nhà với chi phí hợp lý.</p>
        
        <h2>1. Tạ đơn (Dumbbells)</h2>
        <p>Đa năng và dễ sử dụng, phù hợp cho mọi bài tập từ tay, vai, ngực đến chân.</p>
        
        <h2>2. Resistance Bands</h2>
        <p>Nhỏ gọn, dễ mang theo và cung cấp kháng lực tốt cho mọi nhóm cơ.</p>
        
        <h2>3. Yoga Mat</h2>
        <p>Không chỉ cho yoga, thảm tập còn cần thiết cho các bài tập sàn và giãn cơ.</p>
        
        <h2>4. Kettlebell</h2>
        <p>Tuyệt vời cho bài tập cardio và tăng cường sức mạnh toàn thân.</p>
        
        <h2>5. Pull-up Bar</h2>
        <p>Xà đơn giúp tập lưng, vai và tay hiệu quả mà không tốn nhiều không gian.</p>
      `,
    },
    {
      id: 6,
      title: "Bí Quyết Phục Hồi Cơ Bắp Sau Tập Luyện",
      slug: "bi-quyet-phuc-hoi-co-bap",
      excerpt:
        "Tìm hiểu những phương pháp phục hồi cơ bắp hiệu quả giúp bạn tránh chấn thương và tập luyện tốt hơn.",
      category: "Fitness",
      author: "Vũ Thị F",
      date: "02/11/2024",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      readTime: "6 phút đọc",
      content: `
        <h2>Tại sao phục hồi quan trọng?</h2>
        <p>Cơ bắp phát triển trong quá trình nghỉ ngơi, không phải trong lúc tập. Phục hồi đúng cách giúp tránh chấn thương và tăng hiệu quả tập luyện.</p>
        
        <h2>1. Nghỉ ngơi đầy đủ</h2>
        <p>Ngủ 7-9 giờ mỗi đêm để cơ thể tái tạo và phục hồi tối ưu.</p>
        
        <h2>2. Dinh dưỡng sau tập</h2>
        <p>Ăn protein và carbs trong vòng 30-60 phút sau tập để hỗ trợ phục hồi cơ.</p>
        
        <h2>3. Kéo giãn và massage</h2>
        <p>Dành 10-15 phút kéo giãn sau mỗi buổi tập. Massage bằng foam roller cũng rất hiệu quả.</p>
        
        <h2>4. Hydration</h2>
        <p>Uống đủ nước giúp loại bỏ độc tố và duy trì hiệu suất cơ bắp.</p>
        
        <h2>5. Active Recovery</h2>
        <p>Vào ngày nghỉ, thực hiện các hoạt động nhẹ nhàng như đi bộ, yoga để tăng tuần hoàn máu.</p>
      `,
    },
  ];

  // Tìm bài viết theo slug
  const post = blogPosts.find((p) => p.slug === slug);

  // Nếu không tìm thấy bài viết
  if (!post) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gray-50 mt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Không tìm thấy bài viết
            </h1>
            <Link
              to="/blog"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ← Quay lại trang Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Bài viết liên quan (cùng category, khác id)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-16">
        {/* Hero Image */}
        <div className="relative h-96 bg-gray-900">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4">
              <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                {post.title}
              </h1>
              <div className="flex items-center gap-6 text-white text-sm">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.date}
                </span>
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link
                to="/blog"
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại Blog
              </Link>
            </div>

            {/* Article Content */}
            <article className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  lineHeight: "1.8",
                }}
              />

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết:</h3>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>
                  <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-8">Bài viết liên quan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300"
                    >
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <span className="text-blue-600 text-sm font-semibold">
                          {relatedPost.category}
                        </span>
                        <h3 className="text-lg font-bold mt-2 mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;