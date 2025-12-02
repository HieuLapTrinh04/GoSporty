import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample blog posts data
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
    },
  ];

  const categories = ["all", "Fitness", "Gear", "Nutrition", "Yoga"];

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              Blog GoSporty
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto">
              Khám phá kiến thức, mẹo vặt và hướng dẫn về thể thao, sức khỏe và
              lối sống năng động
            </p>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full md:w-1/2">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full transition ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat === "all" ? "Tất cả" : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300"
              >
                {/* Image */}
                <Link to={`/blog/${post.slug}`}>
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-110 transition duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      Đọc tiếp
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Không tìm thấy bài viết nào
              </h3>
              <p className="text-gray-500">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
              </p>
            </div>
          )}

          {/* Newsletter Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Đăng Ký Nhận Bản Tin</h3>
            <p className="mb-6 max-w-2xl mx-auto">
              Nhận những bài viết mới nhất, tips hữu ích và ưu đãi đặc biệt từ
              GoSporty
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition" onClick={() => toast.success("Bạn đã đăng ký thành công!")}>
                Đăng Ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
