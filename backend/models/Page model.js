const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pageSchema = new Schema({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: "Page", default: null }, // for nesting
  userId: { type: String, required: true }, // to scope pages to a user
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Page", pageSchema);
