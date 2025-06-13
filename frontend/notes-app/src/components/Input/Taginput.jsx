import React, { useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => setInputValue(e.target.value);

  const addNewTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-2 bg-white dark:bg-gray-700 shadow-md rounded-full px-4 py-1 select-none text-sm font-medium text-gray-800 dark:text-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              #{tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => handleRemoveTag(tag)}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <MdClose size={16} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <input
          type="text"
          value={inputValue}
          placeholder="Add a tag..."
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-white dark:bg-gray-800 shadow-inner border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-500 transition text-gray-900 dark:text-gray-100"
          aria-label="Add new tag"
        />
        <button
          type="button"
          onClick={addNewTag}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 dark:shadow-lg dark:hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-md"
          aria-label="Add tag"
        >
          <MdAdd size={24} />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
