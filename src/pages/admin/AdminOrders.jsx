import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api"; // ✅ Import api service

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Kiểm tra user và token
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("👤 User:", user);
      console.log("🔑 Token exists:", !!token);
      console.log("👮 Is Admin:", user.isAdmin);
      
      console.log("🔄 Fetching orders...");
      
      // ✅ Gọi endpoint admin (giống Dashboard)
      const response = await api.get("/admin/orders");
      
      console.log("✅ Response:", response);
      console.log("✅ Response data:", response.data);
      console.log("✅ Is Array:", Array.isArray(response.data));
      
      // ✅ Set orders từ response.data
      const ordersData = Array.isArray(response.data) ? response.data : [];
      console.log("✅ Setting orders:", ordersData.length, "items");
      setOrders(ordersData);
      
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      console.error("❌ Error response:", err.response);
      
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 404) {
        setError("Endpoint không tồn tại. Kiểm tra backend.");
      } else if (err.message.includes('Network Error')) {
        setError("Không thể kết nối đến server. Kiểm tra backend có đang chạy không.");
      } else {
        setError(`Không thể tải danh sách đơn hàng: ${err.message}`);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const orderId = order._id || "";
        const customerName = order.customerName || "";
        const customerEmail = order.customerEmail || "";
        
        return (
          orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // ✅ Dùng api service
      await api.put(`/orders/${orderId}`, { status: newStatus });

      // Cập nhật local state
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setShowDetailModal(false);
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-800";
      case "Đang giao":
        return "bg-blue-100 text-blue-800";
      case "Đã xác nhận":
        return "bg-blue-100 text-blue-800";
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-800";
      case "Đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
            <Link to="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">
              ← Quay lại Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Lỗi:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Debug Info */}
        {!loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            <p className="text-sm">
              <strong>Debug:</strong> Tìm thấy {orders.length} đơn hàng | 
              Hiển thị {filteredOrders.length} đơn hàng sau filter
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên KH, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", "Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy"].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status === "all" ? "Tất cả" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thanh toán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">
                        {order._id ? order._id.slice(-6).toUpperCase() : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.customerPhone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewOrderDetail(order)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700">Không tìm thấy đơn hàng</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm || statusFilter !== "all" 
                  ? "Thử thay đổi bộ lọc để xem kết quả khác" 
                  : "Chưa có đơn hàng nào trong hệ thống"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Chi tiết đơn hàng #{selectedOrder._id ? selectedOrder._id.slice(-6).toUpperCase() : "N/A"}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-bold text-lg mb-3">Thông tin khách hàng</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-semibold">Họ tên:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-semibold">Email:</span> {selectedOrder.customerEmail}</p>
                  <p><span className="font-semibold">SĐT:</span> {selectedOrder.customerPhone}</p>
                  <p><span className="font-semibold">Địa chỉ:</span> {selectedOrder.address}</p>
                  {selectedOrder.note && (
                    <p><span className="font-semibold">Ghi chú:</span> {selectedOrder.note}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-lg mb-3">Sản phẩm</h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start bg-gray-50 rounded-lg p-3">
                      <div className="flex gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.qty || item.quantity}
                          </p>
                          {item.selectedColor && (
                            <p className="text-xs text-gray-500">Màu: {item.selectedColor}</p>
                          )}
                          {item.selectedSize && (
                            <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.price * (item.qty || item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Phương thức thanh toán:</span>
                  <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>Ngày đặt hàng:</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="font-bold text-lg mb-3">Cập nhật trạng thái</h3>
                <div className="flex gap-2 flex-wrap">
                  {["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy"].map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      className={`px-4 py-2 rounded-lg transition ${
                        selectedOrder.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;