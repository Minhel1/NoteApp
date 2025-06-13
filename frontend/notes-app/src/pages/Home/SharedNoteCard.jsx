import React from "react";

const SharedNoteCard = ({ title, content, date, tags }) => {
  return (
    <div className="bg-white border rounded-xl shadow p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700 mb-2">{content}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedNoteCard;
