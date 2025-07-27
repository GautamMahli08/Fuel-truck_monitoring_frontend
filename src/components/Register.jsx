import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    company_name: "",
    contact_number: "",
    location: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      alert("Registration failed: " + err.response.data.detail);
      return;
    }

    const goTo = window.confirm("🎉 Registration successful! Go to dashboard?");
    if (goTo) {
      navigate("/dashboard");
    } else {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full mb-4 p-2 border rounded" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required className="w-full mb-4 p-2 border rounded" />
        <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company Name" required className="w-full mb-4 p-2 border rounded" />
        <input name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="Contact Number" required className="w-full mb-4 p-2 border rounded" />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required className="w-full mb-6 p-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}
