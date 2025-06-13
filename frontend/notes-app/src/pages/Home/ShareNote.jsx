import React, { useState } from "react";
import axiosInstance from "./axiosInstance";

function ShareNote({ noteId }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleShare = async () => {
    if (!email) {
      setMessage("Please enter an email.");
      return;
    }

    try {
      const response = await axiosInstance.post(`/share-note/${noteId}`, {
        email,
      });
      if (response.data.success) {
        setMessage("Note shared successfully!");
      } else {
        setMessage(response.data.message || "Failed to share note.");
      }
    } catch (error) {
      setMessage("Error sharing note. Please try again.");
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter email to share note"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleShare}>Share Note</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ShareNote;
