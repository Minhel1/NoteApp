router.get("/reminders-due", async (req, res) => {
  const userId = req.user?.id || req.query.userId; // Adjust depending on your auth
  const now = new Date();
  const fiveMinsLater = new Date(now.getTime() + 5 * 60000);

  try {
    const reminders = await Note.find({
      userId,
      reminderDate: { $lte: fiveMinsLater },
    });
    res.json({ reminders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
