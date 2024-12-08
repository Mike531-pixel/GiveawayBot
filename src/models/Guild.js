const { Schema, model } = require("mongoose");

module.exports = model(
  "Guild",
  new Schema({
    id: { type: String, required: false },
    embedColor: { type: String, default: "#0000FF" },
    giveawayEmoji: { type: String, default: "🎉" },
  })
);
