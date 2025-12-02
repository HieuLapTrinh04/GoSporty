import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <svg
              className="w-16 h-16 text-green-600"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Đặt hàng thành công! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Cảm ơn bạn đã mua hàng tại GoSporty
          </p>
        </div>

        {/* Order Info Card */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Mã đơn hàng</p>
                  <p className="text-2xl font-bold">#{order._id.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm mb-1">Trạng thái</p>
                  <span className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-semibold">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Timeline */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Quy trình xử lý đơn hàng
                </h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">Đơn hàng đã được đặt</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center z-10">
                      <span className="text-gray-600 font-bold">2</span>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-600">Đang xác nhận</p>
                      <p className="text-sm text-gray-400">Chúng tôi đang xác nhận đơn hàng</p>
                    </div>
                  </div>

                  <div className="relative flex items-start mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center z-10">
                      <span className="text-gray-600 font-bold">3</span>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-600">Đang giao hàng</p>
                      <p className="text-sm text-gray-400">Đơn hàng đang trên đường đến bạn</p>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center z-10">
                      <span className="text-gray-600 font-bold">4</span>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-600">Đã giao hàng</p>
                      <p className="text-sm text-gray-400">Đơn hàng đã được giao thành công</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">Họ tên:</span>{" "}
                      {order.customerName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">Email:</span>{" "}
                      {order.customerEmail}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">SĐT:</span>{" "}
                      {order.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Địa chỉ giao hàng
                  </h3>
                  <p className="text-gray-600 text-sm">{order.address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Màu: {item.selectedColor} | Size: {item.selectedSize}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Số lượng: {item.qty}</span>
                          <span className="font-bold text-blue-600">
                            {formatPrice(item.price * item.qty)}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t mt-6 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Phương thức thanh toán</span>
                    <span className="font-semibold">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Tổng tiền</span>
                    <span className="text-red-600">{formatPrice(order.total)}₫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Tiếp tục mua sắm
          </Link>
          
          <Link
            to="/orders"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xem đơn hàng của tôi
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Cần hỗ trợ?</h3>
              <p className="text-gray-600 mb-3">
                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Hotline:</span> 0567197354
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> support@gosporty.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;