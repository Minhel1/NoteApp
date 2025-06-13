import React, { useState } from "react";
import axios from "axios";
import SearchBar from "./SearchBar"; // adjust path as needed

const SearchPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    try {
      const res = await axios.get(
        `/api/notes/search?q=${encodeURIComponent(searchValue)}`
      );
      setResults(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setResults([]);
  };

  return (
    <div className="p-4 space-y-4">
      <SearchBar
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        handleSearch={handleSearch}
        onClearSearch={handleClearSearch}
      />

      <div className="space-y-3">
        {results.length > 0
          ? results.map((note) => (
              <div
                key={note._id}
                className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow"
              >
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  By {note.owner?.email || "Unknown"}
                </p>
                <p className="mt-1">{note.content.slice(0, 150)}...</p>
              </div>
            ))
          : searchValue && (
              <p className="text-gray-500 dark:text-gray-400">
                No results found.
              </p>
            )}
      </div>
    </div>
  );
};

export default SearchPage;
