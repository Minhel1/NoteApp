import React from "react";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  return (
    userInfo && (
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-xl shadow-md px-4 py-2">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 text-white font-bold text-lg select-none shadow-lg">
          {getInitials(userInfo.fullName)}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {userInfo.fullName}
          </p>
          <button
            onClick={onLogout}
            aria-label="Logout"
            className="mt-1 inline-flex items-center px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-red-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default ProfileInfo;
