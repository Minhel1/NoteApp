import moment from "moment";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  MdOutlinePushPin,
  MdCreate,
  MdDelete,
  MdShare,
  MdDownload,
} from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tags = [],
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
  onShare,
  onDownload,
  isSharedByMe = false,
  isDeleted = false,
  onRestore,
  onPermanentDelete,
  reminderDate,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDownload = () => {
    onDownload();
    toast.success("Downloaded successfully ✅");
  };

  const extractFontSize = (htmlContent) => {
    if (!htmlContent) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const sizedElements = [...doc.querySelectorAll("[class*='ql-size-']")];
    const sizePriority = {
      small: 0.85,
      normal: 1,
      large: 1.25,
      huge: 1.5,
    };

    let detectedSize = sizePriority.normal;

    sizedElements.forEach((el) => {
      const classes = el.className.split(/\s+/);
      classes.forEach((cls) => {
        if (cls.startsWith("ql-size-")) {
          const sizeKey = cls.replace("ql-size-", "");
          if (sizePriority[sizeKey] && sizePriority[sizeKey] > detectedSize) {
            detectedSize = sizePriority[sizeKey];
          }
        }
      });
    });

    const styledElements = [...doc.querySelectorAll("[style]")];
    styledElements.forEach((el) => {
      const fontSizeMatch = el.style.fontSize;
      if (fontSizeMatch) {
        let px = parseFloat(fontSizeMatch);
        if (!isNaN(px)) {
          let emSize = px / 16;
          if (emSize > detectedSize) detectedSize = emSize;
        }
      }
    });

    return detectedSize;
  };

  const fontSizeEm = extractFontSize(content) || 1;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl p-6 shadow-md dark:shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:scale-[1.03] cursor-default select-none">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h6>
            <time className="text-xs text-gray-400 dark:text-gray-500 block">
              {moment(date).format("Do MMM YYYY")}
            </time>

            {reminderDate && (
              <div
                className={`text-xs font-semibold mt-1 ${
                  moment(reminderDate).isBefore(moment())
                    ? "text-red-500 dark:text-red-400"
                    : "text-indigo-500 dark:text-indigo-300"
                }`}
              >
                ⏰ Reminder: {moment(reminderDate).format("Do MMM, h:mm A")}
              </div>
            )}

            {isSharedByMe && (
              <span className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">
                Shared by you
              </span>
            )}
          </div>

          {!isDeleted && (
            <button
              onClick={onPinNote}
              aria-label={isPinned ? "Unpin note" : "Pin note"}
              className={`p-2 rounded-full transition-colors ${
                isPinned
                  ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700"
                  : "text-gray-300 dark:text-gray-500 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <MdOutlinePushPin className="text-xl" />
            </button>
          )}
        </div>

        <div
          className="max-w-none mb-5"
          style={{ fontSize: `${fontSizeEm}em` }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-200 text-xs font-medium px-3 py-1 rounded-full select-text"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            {isDeleted ? (
              <>
                {onRestore && (
                  <button
                    onClick={onRestore}
                    aria-label="Restore note"
                    className="p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-700 text-yellow-600 dark:text-yellow-300 transition"
                  >
                    ♻️
                  </button>
                )}
                {onPermanentDelete && (
                  <button
                    onClick={onPermanentDelete}
                    aria-label="Permanently delete note"
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-300 transition"
                  >
                    🗑️
                  </button>
                )}
              </>
            ) : (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    aria-label="Edit note"
                    className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-700 text-green-600 dark:text-green-300 transition"
                  >
                    <MdCreate className="text-lg" />
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    aria-label="Delete note"
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-300 transition"
                  >
                    <MdDelete className="text-lg" />
                  </button>
                )}

                {onShare && (
                  <button
                    onClick={onShare}
                    aria-label="Share note"
                    className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-700 text-purple-600 dark:text-purple-300 transition"
                  >
                    <MdShare className="text-lg" />
                  </button>
                )}

                {onDownload && (
                  <button
                    onClick={handleDownload}
                    aria-label="Download note"
                    className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-700 text-green-600 dark:text-green-300 transition"
                  >
                    <MdDownload className="text-lg" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this note? It will be moved to
              Trash.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
              >
                No
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowConfirm(false);
                }}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteCard;
