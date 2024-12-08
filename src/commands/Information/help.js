const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: "shows commands",

  run: async ({ client, context, guildData}) => {
    return await context.createMessage({
      content:
        "<:yay:1310201036732104746> **GiveawayBot** Commands <:yay:1310201036732104746>",
      embeds: [
        new EmbedBuilder()
          .setColor(guildData.embedColor)
          .addFields({
            name: `General Commands`,
            value: `\`/about\`\n\`/ping\`\n\`/invite\``,
          })
          .addFields({
            name: `Giveaway Creation Commands`,
            value: `\`/start\`\n\`/create\``,
          })
          .addFields({
            name: `Giveaway Manipulation Commands`,
            value: `\`/end\`\n\`/delete\`\n\`/reroll\`\n\`/list\``,
          })
          .addFields({
            name: `GiveawayBot Settings Commands`,
            value: `\`/settings\`\n\`/setcolor\`\n\`/setemoji\``,
          }),
      ],
    });
  },
};
