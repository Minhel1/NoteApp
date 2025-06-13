exports.getDueReminders = async (req, res) => {
  try {
    const now = new Date();
    const notes = await Note.find({
      userId: req.user.id,
      reminderDate: { $ne: null, $lte: now },
    });

    res.json({ reminders: notes });
  } catch (err) {
    console.error("Error getting reminders:", err);
    res.status(500).json({ message: "Failed to fetch reminders." });
  }
};
