exports.addNote = async (req, res) => {
  try {
    const { title, content, tags, reminderDate } = req.body;

    const note = new Note({
      title,
      content,
      tags,
      userId: req.user.id,
      reminderDate, // ✅ add this line
    });

    await note.save();
    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ message: "Failed to add note" });
  }
};
