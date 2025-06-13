// ... all imports remain unchanged
import React, { useState, useEffect } from "react";
import TagInput from "../../components/Input/Taginput";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";
import ReactQuill from "react-quill";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "quill/dist/quill.snow.css";
import Quill from "quill";

const Font = Quill.import("formats/font");
Font.whitelist = [
  "poppins",
  "arial",
  "roman",
  "sans-serif",
  "serif",
  "monospace",
];
Quill.register(Font, true);

const AddEditNotes = ({
  noteData,
  type,
  getAllNotes,
  onClose,
  showToastMessage,
  clippedTitle = "",
  clippedContent = "",
}) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [reminderDate, setReminderDate] = useState(
    noteData?.reminderDate ? new Date(noteData.reminderDate) : null
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Clipped Title:", clippedTitle);
    console.log("Clipped Content:", clippedContent);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        handleAddNote();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, tags, reminderDate]);

  const stripHtml = (html) => html.replace(/<[^>]*>?/gm, "").trim();

  const addNewNote = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
        reminderDate,
      });
      if (response.data?.note) {
        showToastMessage("Note Added Successfully");
        getAllNotes();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const editNote = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/edit-note/${noteData._id}`, {
        title,
        content,
        tags,
        reminderDate,
      });
      if (response.data?.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!title.trim()) {
      setError("Please enter the title");
      return;
    }
    if (!stripHtml(content)) {
      setError("Please enter the content");
      return;
    }
    setError("");
    type === "edit" ? editNote() : addNewNote();
  };

  const handleClip = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title: clippedTitle || "Untitled Clip",
        content: clippedContent || "No content clipped.",
        tags: [],
        reminderDate: null,
      });

      if (response.data?.note) {
        showToastMessage("Clipped successfully");
        getAllNotes();
        onClose();
      }
    } catch (err) {
      showToastMessage("Failed to clip this page");
      console.error(err);
    }
  };

  const quillModules = {
    toolbar: [
      [{ font: Font.whitelist }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "color",
    "background",
    "list",
    "bullet",
  ];

  return (
    <div className="relative max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={onClose}
        aria-label="Close form"
        title="Close"
        className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        <MdClose className="text-gray-500 dark:text-gray-300 hover:text-indigo-600 transition-colors duration-300" />
      </button>

      <div className="flex flex-col gap-3">
        <label
          htmlFor="title"
          className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide select-none"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="text-2xl font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-2xl px-5 py-3 border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-300"
          placeholder="Go To Gym At 5"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
          autoComplete="off"
          spellCheck="false"
          autoFocus
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-3 mt-5">
        <label
          htmlFor="content"
          className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide select-none"
        >
          Content
        </label>
        <ReactQuill
          id="content"
          value={content}
          onChange={setContent}
          modules={quillModules}
          formats={quillFormats}
          placeholder="Write your note here..."
          className="bg-white dark:bg-gray-800 dark:text-white rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm"
          theme="snow"
          readOnly={loading}
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="tags-input"
          className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1 block select-none"
        >
          Tags
        </label>
        <TagInput
          id="tags-input"
          name="tags"
          tags={tags}
          setTags={setTags}
          disabled={loading}
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="reminder-date"
          className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1 block select-none"
        >
          Reminder Date
        </label>
        <DatePicker
          id="reminder-date"
          selected={reminderDate}
          onChange={(date) => setReminderDate(date)}
          showTimeSelect
          dateFormat="Pp"
          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholderText="Select date and time"
          disabled={loading}
        />
      </div>

      {error && (
        <p
          className="mt-5 text-sm text-red-600 font-semibold select-none"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      {clippedTitle || clippedContent ? (
        <button
          type="button"
          onClick={handleClip}
          className="w-full mt-4 py-3 rounded-3xl text-white font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          Clip This Page
        </button>
      ) : null}

      <button
        type="button"
        onClick={handleAddNote}
        disabled={loading}
        aria-busy={loading}
        className={`w-full mt-6 py-3 rounded-3xl text-white font-bold shadow-lg transition-transform duration-300 ease-in-out
          ${
            loading
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300"
          }`}
      >
        {loading ? "Saving..." : type === "edit" ? "UPDATE" : "ADD"}
      </button>
    </div>
  );
};

export default AddEditNotes;
