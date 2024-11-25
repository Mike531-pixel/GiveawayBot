const data = require("../../models/Guild");

module.exports = {
  name: "settings",
  description: "Configure the giveaway settings",
  permission: "ManageGuild",

  run: async ({ client, context }) => {
    const guildData = await data.findOne({ id: context.guildId });
    return context.createMessage({
      content: `<:yay:1310201036732104746> **Current Giveaway Settings:**
        - Color: ${guildData?.giveawayColor || "Not set"}
        - Emoji: ${guildData?.giveawayEmoji || "Not set"}`,
    });
  },
};
