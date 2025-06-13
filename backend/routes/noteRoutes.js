const express = require("express");
const router = express.Router();
const Note = require("../models/noteModel");

// GET /reminders-due?userId=<userId>
router.get("/reminders-due", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId in query." });
  }

  const now = new Date();

  try {
    const reminders = await Note.find({
      userId,
      reminderDate: { $lte: now },
      isArchived: false,
    });

    res.status(200).json({ reminders });
  } catch (err) {
    console.error("Error fetching due reminders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /share-note/:noteId
router.post("/share-note/:noteId", authenticateUser, async (req, res) => {
  const { noteId } = req.params;
  const { email } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const userToShare = await User.findOne({ email });
    if (!userToShare)
      return res.status(404).json({ message: "User not found" });

    if (!note.sharedWith.includes(userToShare._id)) {
      note.sharedWith.push(userToShare._id);
      await note.save();
    }

    res.json({ success: true, message: "Note shared successfully" });
  } catch (err) {
    console.error("Share note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
