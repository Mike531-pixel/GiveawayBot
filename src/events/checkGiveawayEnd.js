const GiveawayData = require("../models/GiveawayData");

/**
 * @param {import("../structures/Client")} client
 * @param {import("discord.js").Role}
 */

module.exports = async (client) => {
  const checkGiveaways = async () => {
    try {
      const guilds = await GiveawayData.find({ isActive: true });

      guilds.forEach(async (giveaway) => {
        await client.util.checkGiveawayEnd(giveaway.messageId);
      });
    } catch (error) {
      console.error("Error checking giveaways:", error);
    }

    setTimeout(checkGiveaways, 3000);
  };

  checkGiveaways();
};
