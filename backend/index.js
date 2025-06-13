require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();
const httpServer = http.createServer(app); // ✅ create HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors({ origin: "*" }));

// Socket.IO map of userId to socket
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", (userId) => {
    console.log("User registered for socket:", userId);
    userSockets.set(userId, socket);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (const [userId, s] of userSockets.entries()) {
      if (s.id === socket.id) userSockets.delete(userId);
    }
  });
});

// Example usage: send to a user when a reminder is due
const sendReminderNotification = (userId, reminder) => {
  const socket = userSockets.get(userId);
  if (socket) {
    socket.emit("reminder_due", reminder);
  }
};
// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "Full Name, Email and Password are required",
    });
  }

  const isUser = await User.findOne({ email });

  if (isUser) {
    return res.json({ error: true, message: "User already exist" });
  }

  const user = new User({ fullName, email, password });
  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    user: { fullName: user.fullName, email: user.email, _id: user._id },
    accessToken,
    message: "Registration Successful",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const userInfo = await User.findOne({ email });
  if (!userInfo || userInfo.password !== password) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid Credentials" });
  }

  const user = { user: userInfo };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });

  return res.json({
    error: false,
    message: "Login Successful",
    email,
    accessToken,
  });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "",
  });
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags, reminderDate } = req.body;
  const { user } = req.user;

  if (!title || !content) {
    return res
      .status(400)
      .json({ error: true, message: "Title and Content are required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
      reminderDate,
    });

    await note.save();

    return res.json({ error: false, note, message: "Note added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Get My Notes
app.get("/my-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({
      $or: [{ userId: user._id }, { sharedWith: user._id }],
    }).sort({ isPinned: -1 });

    res.json({
      error: false,
      notes,
      message: "All notes (owned and shared) retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// Share Note
app.post("/share-note/:noteId", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { email } = req.body;
  const { noteId } = req.params;

  try {
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!note.sharedWith.includes(targetUser._id)) {
      note.sharedWith.push(targetUser._id);
      await note.save();
    }

    return res.json({ success: true, message: "Note shared successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

// Get All Owned Notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    const markedNotes = notes.map((note) => ({
      ...note.toObject(),
      isSharedByMe:
        Array.isArray(note.sharedWith) && note.sharedWith.length > 0,
    }));

    return res.json({
      error: false,
      notes: markedNotes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Get Shared Notes
app.get("/shared-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ sharedWith: user._id });
    return res.json({
      error: false,
      notes,
      message: "Shared notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned, reminderDate } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags && reminderDate === undefined) {
    return res.status(400).json({ error: true, message: "No changes provide" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (reminderDate !== undefined) note.reminderDate = reminderDate;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Update isPinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  if (typeof isPinned !== "boolean") {
    return res
      .status(400)
      .json({ error: true, message: "isPinned must be boolean" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message:
          "Note not found or you don't have permission to edit this note.",
      });
    }

    note.isPinned = isPinned;
    await note.save();

    return res.json({
      error: false,
      note,
      message: `Note has been ${
        isPinned ? "pinned" : "unpinned"
      } successfully.`,
    });
  } catch (error) {
    console.error("Error updating pinned status:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

// Get due reminders
app.get("/reminders-due", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const now = new Date();
    const reminders = await Note.find({
      reminderDate: { $lte: now },
      $or: [{ userId: user._id }, { sharedWith: user._id }],
    }).sort({ reminderDate: 1 });

    // Emit real-time notification if reminders are due
    if (reminders.length > 0) {
      const socketId = userSockets.get(user._id.toString());
      if (socketId) {
        io.to(socketId).emit("reminder_due", {
          message: "Reminder due!",
          reminders,
        });
      }
    }

    res.status(200).json({ reminders });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/reminders/clear", authenticateToken, async (req, res) => {
  const { userId } = req.body;

  try {
    await Note.updateMany(
      {
        reminderDate: { $lte: new Date() },
        $or: [{ userId }, { sharedWith: userId }],
      },
      { $unset: { reminderDate: "" } } // This removes the reminder
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing reminders:", error);
    res.status(500).json({ error: "Failed to clear reminders" });
  }
});

mongoose
  .connect(config.connectionString)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(8000, () => {
      console.log("Server listening on port 8000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
