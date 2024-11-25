const { Schema, model } = require("mongoose");

module.exports = model(
  "GiveawayData",
  new Schema({
    id: { type: String, required: false },
    channelId: { type: String, required: false },
    description: { type: String, required: false },
    messageId: { type: String, required: false, unique: true },
    prize: { type: String, required: false },
    hostId: { type: String, required: false },
    winnersCount: { type: Number, required: false },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, required: false },
    participants: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    entryCount: { type: Number, default: 0 },
  })
);
