import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import { CartContext } from "../context/CartContext";

const Login = () => {
  const navigate = useNavigate();
  const { syncCartToServer } = useContext(CartContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Logging in...");
      
      // 1. Login
      const res = await api.post("/login", formData);
      
      console.log("✅ Login successful:", res.data);

      // 2. Lưu token
      const token = res.data.token;
      setAuthToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem('userId', res.data.user._id);

      // 3. Lưu user info nếu có
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // 4. ✅ SYNC CART TỪ LOCALSTORAGE LÊN SERVER
      try {
        console.log("🔄 Syncing cart...");
        await syncCartToServer();
        console.log("✅ Cart synced successfully");
      } catch (syncErr) {
        console.warn("⚠️ Cart sync failed, but login successful:", syncErr);
        // Không block login nếu sync thất bại
      }

      // 5. Redirect
      console.log("✅ Login successful, checking user role...");
      
      // ✅ Check if user is admin
      if (res.data.user && res.data.user.isAdmin) {
        console.log("✅ Admin user detected, redirecting to admin dashboard");
        navigate("/admin");
        window.location.reload();
      } else {
        console.log("✅ Regular user, redirecting to home page");
        navigate("/");
        window.location.reload();
      }

    } catch (err) {
      console.error("❌ Login error:", err);
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              đăng ký tài khoản mới
            </a>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <a
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;