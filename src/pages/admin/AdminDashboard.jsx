import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api"; // ✅ SỬA 1: Import dịch vụ api

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // ✅ SỬA 2: Bắt đầu là true
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    todayRevenue: 0,
    todayOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // ✅ SỬA 3: Bọc fetchDashboardData trong useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ SỬA 4: Chạy 3 API song song để tải nhanh hơn
      const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/orders/recent"),
        api.get("/admin/products/top"),
      ]);

      // Xử lý Stats
      if (statsRes.status === "fulfilled") {
        console.log("✅ Stats:", statsRes.value.data);
        setStats(statsRes.value.data);
      } else {
        console.error("❌ Stats fetch error:", statsRes.reason);
      }

      // Xử lý Orders
      if (
        ordersRes.status === "fulfilled" &&
        Array.isArray(ordersRes.value.data)
      ) {
        console.log("✅ Orders:", ordersRes.value.data);
        setRecentOrders(ordersRes.value.data.slice(0, 5));
      } else {
        console.error(
          "❌ Orders fetch error:",
          ordersRes.reason || "Orders data is not an array"
        );
        setRecentOrders([]);
      }

      // Xử lý Top Products
      if (
        productsRes.status === "fulfilled" &&
        Array.isArray(productsRes.value.data)
      ) {
        console.log("✅ Top products:", productsRes.value.data);
        setTopProducts(productsRes.value.data);
      } else {
        console.error(
          "❌ Products fetch error:",
          productsRes.reason || "Products data is not an array"
        );
        setTopProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      // Lỗi chung (ví dụ: lỗi mạng)
    } finally {
      setLoading(false); // ✅ SỬA 5: Luôn tắt loading dù thành công hay thất bại
    }
  }, []); // Thêm mảng dependency rỗng

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    // Fetch dashboard data from API
    fetchDashboardData();
  }, [navigate, fetchDashboardData]); // ✅ SỬA 6: Thêm fetchDashboardData vào dependencies

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang giao":
        return "bg-blue-100 text-blue-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống GoSporty</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-semibold">+12.5%</span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalOrders}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-semibold">+8.2%</span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600 font-semibold">+15.3%</span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600 font-semibold">+5.1%</span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Đơn hàng gần đây</h2>
              <Link
                to="/admin/orders"
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            {recentOrders && recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={order._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">
                          {order.orderNumber ||
                            order._id?.toString().slice(-8) ||
                            "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {order.customerName || order.customer || "Khách hàng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status || "Đang xử lý"
                          )}`}
                        >
                          {order.status || "Đang xử lý"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : order.date || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chưa có đơn hàng
                </h3>
                <p className="text-sm text-gray-500">
                  Đơn hàng mới sẽ hiển thị ở đây khi có khách đặt hàng
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Sản phẩm bán chạy</h2>
          </div>

          <div className="p-6">
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div
                    key={product._id || product.id} // Sửa key
                    className="flex items-center gap-4"
                  >
                    <img
                      // ✅ SỬA 7: Kiểm tra URL an toàn hơn
                      src={
                        product?.image && product.image.startsWith("http")
                          ? product.image
                          : product?.images?.[0] && product.images[0].startsWith("http")
                          ? product.images[0]
                          : "https://cdn.shopvnb.com/uploads/gallery/vot-tennis-wilson-pro-staff-team-v14-frm-2-280gr-chinh-hang-wr136011u2_1694641903.webp"
                      }
                      alt={product?.name ?? "Product"}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://cdn.shopvnb.com/uploads/gallery/vot-tennis-wilson-pro-staff-team-v14-frm-2-280gr-chinh-hang-wr136011u2_1694641903.webp";
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {product.name || "Sản phẩm"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales || product.sold || 0} đã bán
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(product.revenue || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="text-base font-semibold text-gray-700 mb-1">
                  Chưa có dữ liệu
                </h3>
                <p className="text-sm text-gray-500">
                  Thống kê sản phẩm bán chạy sẽ hiển thị khi có đơn hàng
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/admin/products"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <svg
            className="w-8 h-8 mx-auto text-blue-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="font-semibold text-gray-800">Quản lý sản phẩm</h3>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <svg
            className="w-8 h-8 mx-auto text-green-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="font-semibold text-gray-800">Quản lý đơn hàng</h3>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <svg
            className="w-8 h-8 mx-auto text-purple-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="font-semibold text-gray-800">Quản lý người dùng</h3>
        </Link>

        <Link
          to="/admin/reports" // Giả sử bạn sẽ tạo route này
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
        >
          <svg
            className="w-8 h-8 mx-auto text-orange-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="font-semibold text-gray-800">Báo cáo & Thống kê</h3>
        </Link>
      </div>
    </div>
  );
};
export default AdminDashboard;