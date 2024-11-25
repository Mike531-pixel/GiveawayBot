const {
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const data = require("../../models/Guild");
const GiveawayData = require("../../models/GiveawayData");

module.exports = {
  name: "start",
  description: "starts a giveaway",
  permission: "ManageGuild",
  options: [
    {
      name: "duration",
      description: "Duration of the giveaway in seconds",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "winners",
      description: "Number of winners",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "prize",
      description: "The prize being given away",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async ({ client, context }) => {
    const prize = context.options.getString("prize");
    const winnersCount = context.options.getInteger("winners");
    const duration = context.options.getString("duration").trim();

    const parsedDuration = await client.util.parseDuration(duration);

    if (parsedDuration === null) {
      return context.createMessage({
        content: `Invalid duration format. Please use \`1s\`, \`1m\`, or \`1h\`.`,
      });
    }

    const guildData = await data.findOne({ id: context.guild.id });
    const channelId = context.channel.id;
    const emoji = guildData.giveawayEmoji;
    const endTime = Date.now() + parsedDuration * 1000;

    const embed = new EmbedBuilder()
    .setColor(guildData.embedColor)
      .setTitle(`**${prize}**`)
      .setDescription(
        `Ends: <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(
          endTime / 1000
        )}:f>)\nHosted by: <@${
          context.user.id
        }>\nEntries: **0**\nWinners: **${winnersCount}**`
      )

      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enterGiveaway")
        .setStyle(ButtonStyle.Primary)
        .setEmoji(emoji)
    );

    const message = await context.channel.send({
      embeds: [embed],
      components: [row],
    });

    const giveaway = new GiveawayData({
      id: context.guild.id,
      channelId,
      messageId: message.id,
      prize,
      hostId: context.user.id,
      winnersCount,
      startTime: Date.now(),
      endTime,
      participants: [],
      isActive: true,
      entryCount: 0,
    });

    await context.createMessage({
      content: `The giveaway was successfully created! ID: ${message.id}`,
    });
    await giveaway.save();
  },
};
