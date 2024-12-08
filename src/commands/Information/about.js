const { EmbedBuilder } = require("discord.js");
const GiveawayData = require("../../models/GiveawayData");
module.exports = {
  name: "about",
  description: "show information about the bot",

  run: async ({ client, context, guildData }) => {
    const guildcount = await client.cluster.fetchClientValues(
      "guilds.cache.size"
    );
    const giveawaycount = await GiveawayData.countDocuments();

    return await context.createMessage({
      content:
        "<:yay:1310201036732104746> All about **GiveawayBot** <:yay:1310201036732104746>",
      embeds: [
        new EmbedBuilder()
        .setColor(guildData.embedColor)
          .setTitle("Hold giveaways quickly and easily!")
          .setDescription(
            `Hello! I'm **GiveawayBot**, and I'm here to make it as easy as possible to hold giveaways on your Discord server! I was created by [random.js](https://discord.com/users/878975596623986700) (<@878975596623986700>). \nDon't forget to start this project at **https://github.com/ItzRandom23/GiveawayBot/**!`
          )
          .addFields({
            name: "📊 Stats",
            value: `${giveawaycount} giveaways \n${guildcount} servers`,
            inline: true,
          })
          .addFields({
            name: "🌐 Links",
            value: `[Source Code](https://github.com/ItzRandom23/GiveawayBot)\n[Support](https://discord.gg/cool-music-support-925619107460698202)`,
            inline: true,
          }),
      ],
    });
  },
};
