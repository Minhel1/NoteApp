import React, { useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { MdDeleteOutline } from "react-icons/md";

const Toast = ({ isShown, message, type = "success", onClose }) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [onClose]);

  const icon =
    type === "delete" ? (
      <MdDeleteOutline className="text-xl text-red-500" />
    ) : (
      <LuCheck className="text-xl text-green-500" />
    );

  const bgColor =
    type === "delete"
      ? "bg-red-50 dark:bg-red-900"
      : "bg-green-50 dark:bg-green-900";

  const borderColor =
    type === "delete" ? "after:bg-red-500" : "after:bg-green-500";

  return (
    <div>
      <div
        className={`absolute top-20 right-6 transition-all duration-300 ${
          isShown ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`min-w-52 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-2xl rounded-md relative after:w-[5px] after:h-full ${borderColor} after:absolute after:left-0 after:top-0 after:rounded-l-lg`}
        >
          <div className="flex items-center gap-3 py-2 px-4">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full ${bgColor}`}
            >
              {icon}
            </div>
            <p className="text-sm text-slate-800 dark:text-white">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
