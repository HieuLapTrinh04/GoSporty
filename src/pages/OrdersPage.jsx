import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = process.env.REACT_APP_API_URL;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      // Gọi API với userId trong query params
      const response = await axios.get(
        `${API_URL}/api/orders?userId=${userId}`
      );
      
      // Mapping trạng thái tiếng Việt sang tiếng Anh
      const normalizedOrders = response.data.map(order => ({
        ...order,
        status: normalizeStatus(order.status)
      }));
      
      setOrders(normalizedOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  // Hàm chuyển đổi trạng thái
  const normalizeStatus = (status) => {
    const statusMap = {
      "Chờ xác nhận": "pending",
      "Đã xác nhận": "confirmed",
      "Đang giao": "shipping",
      "Đã giao": "delivered",
      "Đã hủy": "cancelled"
    };
    
    return statusMap[status] || status.toLowerCase();
  };

  // Mở modal hủy đơn
  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // Đóng modal
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrder(null);
    setCancelReason("");
  };

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng chọn lý do hủy đơn");
      return;
    }

    setCancellingOrder(true);
    try {
      const response = await axios.put(
        `${API_URL}/api/orders/${selectedOrder._id}/cancel`,
        {
          cancelReason: cancelReason,
          status: "Đã hủy"
        }
      );

      if (response.data) {
        // Cập nhật lại danh sách đơn hàng
        const updatedOrders = orders.map(order => 
          order._id === selectedOrder._id 
            ? { ...order, status: "cancelled", cancelReason: cancelReason }
            : order
        );
        setOrders(updatedOrders);
        
        alert("Đã hủy đơn hàng thành công!");
        handleCloseCancelModal();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại!");
    } finally {
      setCancellingOrder(false);
    }
  };

  const cancelReasons = [
    "Tôi muốn thay đổi địa chỉ giao hàng",
    "Tôi muốn thay đổi sản phẩm trong đơn hàng",
    "Tôi tìm thấy giá rẻ hơn ở chỗ khác",
    "Tôi đổi ý, không muốn mua nữa",
    "Thời gian giao hàng quá lâu",
    "Lý do khác"
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipping":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchStatus =
      filterStatus === "all" || order.status.toLowerCase() === filterStatus;
    const matchSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Tính toán số lượng đơn hàng theo trạng thái
  const getOrderCountByStatus = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status.toLowerCase() === status.toLowerCase()).length;
  };

  const statusOptions = [
    { value: "all", label: "Tất cả", count: getOrderCountByStatus("all") },
    {
      value: "pending",
      label: "Chờ xác nhận",
      count: getOrderCountByStatus("pending"),
    },
    {
      value: "confirmed",
      label: "Đã xác nhận",
      count: getOrderCountByStatus("confirmed"),
    },
    {
      value: "shipping",
      label: "Đang giao",
      count: getOrderCountByStatus("shipping"),
    },
    {
      value: "delivered",
      label: "Đã giao",
      count: getOrderCountByStatus("delivered"),
    },
    {
      value: "cancelled",
      label: "Đã hủy",
      count: getOrderCountByStatus("cancelled"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đơn hàng của tôi
            </h1>
            <p className="text-gray-600">
              Quản lý và theo dõi tất cả đơn hàng của bạn
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn hàng hoặc tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterStatus(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                      filterStatus === option.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                    <span className="ml-2 text-sm">({option.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Thử thay đổi từ khóa tìm kiếm"
                  : "Bạn chưa có đơn hàng nào"}
              </p>
              {!searchTerm && (
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
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
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Bắt đầu mua sắm
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Mã đơn hàng
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            #{order._id.slice(-8)}
                          </p>
                        </div>
                        <div className="h-12 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-4 items-center pb-4 border-b last:border-b-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 mb-1">
                              Màu: {item.selectedColor} | Size:{" "}
                              {item.selectedSize}
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.qty}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formatPrice(item.price * item.qty)}₫
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t">
                      <div className="flex flex-col sm:flex-row gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Phương thức: </span>
                          <span className="font-semibold text-gray-900">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                        <div>
                          <span className="text-gray-500">Tổng tiền: </span>
                          <span className="text-xl font-bold text-red-600">
                            {formatPrice(order.total)}₫
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to={`/order-success/${order._id}`}
                          className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
                        >
                          Xem chi tiết
                        </Link>

                        {order.status.toLowerCase() === "pending" && (
                          <button 
                            onClick={() => handleOpenCancelModal(order)}
                            className="px-5 py-2.5 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                          >
                            Hủy đơn
                          </button>
                        )}

                        {order.status.toLowerCase() === "delivered" && (
                          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                            Mua lại
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {orders.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Chờ xác nhận</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {
                        orders.filter((o) => o.status.toLowerCase() === "pending")
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Đang giao</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {
                        orders.filter(
                          (o) => o.status.toLowerCase() === "shipping"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Đã giao</p>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        orders.filter(
                          (o) => o.status.toLowerCase() === "delivered"
                        ).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Hủy đơn hàng
                </h3>
                <button 
                  onClick={handleCloseCancelModal}
                  className="text-white hover:bg-red-700 rounded-lg p-1 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="font-bold text-gray-900">#{selectedOrder?._id.slice(-8)}</p>
                <p className="text-sm text-gray-600 mt-2">Tổng tiền</p>
                <p className="font-bold text-red-600 text-lg">{formatPrice(selectedOrder?.total)}₫</p>
              </div>

              {/* Cancel Reason */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Vui lòng chọn lý do hủy đơn <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {cancelReasons.map((reason, index) => (
                    <label 
                      key={index}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                        cancelReason === reason 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Lưu ý</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Sau khi hủy, bạn sẽ không thể khôi phục lại đơn hàng này.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseCancelModal}
                  disabled={cancellingOrder}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason || cancellingOrder}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancellingOrder ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận hủy"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;