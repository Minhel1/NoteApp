import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="w-80 flex items-center px-5 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 transition">
      <input
        type="text"
        placeholder="Search Notes"
        className="w-full text-sm bg-transparent py-2 outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />

      {value && (
        <IoMdClose
          className="text-lg text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 mr-3 transition-colors"
          onClick={onClearSearch}
        />
      )}

      <FaMagnifyingGlass
        className="text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
