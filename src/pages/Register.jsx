import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", form);
      alert("✅ Đăng ký thành công!")
      setMsg("✅ Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      setMsg("❌ Lỗi đăng ký!");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72">
        <input className="border p-2 rounded" placeholder="Họ tên"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 rounded" type="password" placeholder="Mật khẩu"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Đăng ký</button>
      </form>
      <p className="mt-3">{msg}</p>
    </div>
  );
}
export default Register;
