import { useState } from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate } from "react-router";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  let navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", form);
      const { token } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      setMsg("✅ Đăng nhập thành công!");
      navigate("/");
    } catch {
      setMsg("❌ Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Đăng nhập</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-72">
        <input className="border p-2 rounded" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 rounded" type="password" placeholder="Mật khẩu"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700">Đăng nhập</button>
        <p className="text-center">Bạn chưa có tài khoản? <a className="text-blue-600" href="/register">Đăng ký</a></p>
      </form>
      <p className="mt-3">{msg}</p>
    </div>
  );
}
export default Login;
