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
            value: `\`/gabout\`\n\`/gping\`\n\`/ginvite\``,
          })
          .addFields({
            name: `Giveaway Creation Commands`,
            value: `\`/gstart\`\n\`/gcreate\``,
          })
          .addFields({
            name: `Giveaway Manipulation Commands`,
            value: `\`/gend\`\n\`/gdelete\`\n\`/greroll\`\n\`/glist\``,
          })
          .addFields({
            name: `GiveawayBot Settings Commands`,
            value: `\`/gsettings show\`\n\`/gsettings set color\`\n\`/gsettings set emoji\``,
          }),
      ],
    });
  },
};
