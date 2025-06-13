import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/Input/Passwordinput";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post("/login", {
        email,
        password,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
        return;
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        setToast({ show: true, message: "Login successful!", type: "success" });
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        const message = error.response.data.message.toLowerCase();
        if (message.includes("incorrect password")) {
          setError("Incorrect password");
        } else if (message.includes("invalid") || message.includes("wrong")) {
          setError("Invalid email or password");
        } else {
          setError(error.response.data.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar hideSearch />

      <div className="flex items-start justify-center pt-24 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black min-h-screen px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 sm:p-10">
          <form onSubmit={handleLogin}>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-8">
              Login to your account
            </h2>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition text-sm dark:bg-gray-700 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition duration-300 shadow-md"
              >
                Login
              </button>

              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-medium underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Toast
        isShown={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
};

export default Login;
