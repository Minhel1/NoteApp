import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword((prev) => !prev);
  };

  return (
    <div
      className="flex items-center border-[1.5px] px-5 rounded mb-3
                    bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
    >
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="w-full text-sm bg-transparent py-3 mr-3 rounded outline-none
                   text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        aria-label="Password"
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        aria-label={isShowPassword ? "Hide password" : "Show password"}
        className="text-primary cursor-pointer focus:outline-none"
      >
        {isShowPassword ? <FaRegEye size={22} /> : <FaRegEyeSlash size={22} />}
      </button>
    </div>
  );
};

export default PasswordInput;
