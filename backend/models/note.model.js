const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  userId: { type: String, required: true },
  sharedWith: [{ type: String }], // Array of user IDs this note is shared with
  isArchived: { type: Boolean, default: false }, // Soft deletpageId: { type: Schema.Types.ObjectId, ref: "Page", default: null },

  createdOn: { type: Date, default: new Date().getTime() },

  // ✅ New field for reminder
  reminderDate: { type: Date, default: null },
});

module.exports = mongoose.model("Note", noteSchema);
