import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../contexts/Auth/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { signIn } = useContext(AuthContext); // <-- useContext (not use)
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await toast.promise(
        signIn(formData.email, formData.password),
        {
          pending: "Signing you in…",
          success: "Login successful! 🎉",
          error: {
            render({ data }) {
              // data is the error from signIn
              return data?.message || "Login failed! Please check your credentials.";
            },
          },
        }
      );
      navigate("/");
    } catch {
      // error already shown by toast.promise
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 transition-colors px-6 py-12">
      <div className="max-w-md w-full bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
              Email
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-gray-300">
              Password
            </label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b1e3c]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#7b1e3c] hover:bg-[#651730] transition text-white font-semibold py-3 rounded-lg"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-700 dark:text-gray-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#7b1e3c] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;