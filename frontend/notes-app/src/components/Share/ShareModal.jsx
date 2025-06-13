import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ShareModal = ({ isOpen, onRequestClose, onShare, noteTitle }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (email.trim()) {
      onShare(email.trim());
      setEmail("");
      onRequestClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50"
    >
      <h2 className="text-lg font-semibold mb-4">
        Share Note{noteTitle ? `: ${noteTitle}` : ""}
      </h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter recipient email"
        className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:text-white"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onRequestClose}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Share
        </button>
      </div>
    </Modal>
  );
};

export default ShareModal;
