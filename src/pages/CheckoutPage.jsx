import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  // Thông tin khách hàng
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    note: "",
  });

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Tính toán giá
const items = cart?.items || [];
const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // Kiểm tra giỏ hàng rỗng
  useEffect(() => {
    if (!items || items.length === 0) {
      toast.info("Giỏ hàng trống, vui lòng thêm sản phẩm!");
      navigate("/cart");
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!customerInfo.customerName.trim()) {
      toast.error("Vui lòng nhập họ tên!");
      return false;
    }
    if (!customerInfo.customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return false;
    }
    if (!/^[0-9]{10}$/.test(customerInfo.customerPhone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return false;
    }
    if (!customerInfo.customerEmail.trim()) {
      toast.error("Vui lòng nhập email!");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.customerEmail)) {
      toast.error("Email không hợp lệ!");
      return false;
    }
    if (!customerInfo.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng!");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Lấy userId từ localStorage hoặc context
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id || "67..."; // Fallback nếu chưa đăng nhập

      // Chuẩn bị dữ liệu order
      const orderData = {
        userId: userId,
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        customerPhone: customerInfo.customerPhone,
        address: customerInfo.address,
        note: customerInfo.note,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          selectedColor: item.selectedColor || "Mặc định",
          selectedSize: item.selectedSize || "One Size",
        })),
        total: total,
        status: "Chờ xác nhận",
        paymentMethod: paymentMethod,
      };

      console.log("📦 Order data:", orderData);

      // Gửi request tạo order
      const response = await axios.post(`${API_URL}/api/orders`, orderData);

      console.log("✅ Order created:", response.data);

      // Xóa giỏ hàng
      await clearCart();

      // Thông báo thành công
      toast.success("🎉 Đặt hàng thành công!");

      // Chuyển đến trang đơn hàng hoặc trang cảm ơn
      setTimeout(() => {
        navigate(`/order-success/${response.data._id}`);
      }, 1500);
    } catch (error) {
      console.error("❌ Error creating order:", error);
      toast.error(
        error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">
            Vui lòng điền đầy đủ thông tin để hoàn tất đơn hàng
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin khách hàng */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Thông tin khách hàng
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={customerInfo.customerName}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={customerInfo.customerPhone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={customerInfo.customerEmail}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú đơn hàng (tuỳ chọn)
                  </label>
                  <textarea
                    name="note"
                    value={customerInfo.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-sm text-gray-500">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Banking"
                    checked={paymentMethod === "Banking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900">
                      Chuyển khoản ngân hàng
                    </p>
                    <p className="text-sm text-gray-500">
                      Chuyển khoản qua Internet Banking
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Momo"
                    disabled
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900">
                      Ví MoMo{" "}
                      <span className="text-xs text-gray-400">(Sắp ra mắt)</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Thanh toán qua ví điện tử MoMo
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Đơn hàng của bạn
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={item.productId || index} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.selectedColor} / {item.selectedSize}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          x{item.qty}
                        </span>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(item.price * item.qty)}₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-semibold">
                    {formatPrice(subtotal)}₫
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span
                    className={`font-semibold ${
                      shippingFee === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {shippingFee === 0 ? "Miễn phí" : `${formatPrice(shippingFee)}₫`}
                  </span>
                </div>

                {subtotal < 500000 && (
                  <p className="text-xs text-gray-500">
                    💡 Mua thêm {formatPrice(500000 - subtotal)}₫ để được miễn
                    phí vận chuyển
                  </p>
                )}

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatPrice(total)}₫</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
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
                    Đặt hàng
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Thanh toán an toàn 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span>Giao hàng nhanh chóng</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Đổi trả trong 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;