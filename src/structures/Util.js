const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
} = require("discord.js");
const data = require("../models/Guild");
const gwdata = require("../models/GiveawayData");
class Util {
  /**
   *
   * @param {import('./Client')} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Adds or removes the user from the giveaway based on button interaction.
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {string} giveawayId
   */
  async handleGiveawayButton(interaction, giveawayId) {
    const GiveawayData = await gwdata.findOne({ messageId: giveawayId });
    if (!GiveawayData) {
      return interaction.reply({
        content: "Giveaway not found!",
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;

    if (GiveawayData.participants.includes(userId)) {
      GiveawayData.participants = GiveawayData.participants.filter(
        (id) => id !== userId
      );
      GiveawayData.entryCount -= 1;
      await GiveawayData.save();
      interaction.reply({
        content: "You have left the giveaway!",
        ephemeral: true,
      });
    } else {
      GiveawayData.participants.push(userId);
      GiveawayData.entryCount += 1;
      await GiveawayData.save();
      interaction.reply({
        content: "You have entered the giveaway!",
        ephemeral: true,
      });
    }

    this.updateGiveawayEmbed(giveawayId, GiveawayData);
  }

  async updateGiveawayEmbed(giveawayId, GiveawayData) {
    const channel = await this.client.channels.fetch(GiveawayData.channelId);
    const message = await channel.messages.fetch(giveawayId);
    const guildData = await data.findOne({ id: GiveawayData.id });
    if (GiveawayData.description) {
      const embed = new EmbedBuilder()
        .setColor(guildData.embedColor)
        .setTitle(`**${GiveawayData.prize}**`)
        .setDescription(
          `${GiveawayData.description}\n\nEnds: <t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:R> (<t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:f>)\nHosted by: <@${GiveawayData.hostId}>\nEntries: **${GiveawayData.entryCount
          }**\nWinners: **${GiveawayData.winnersCount}**`
        )
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(guildData.embedColor)
        .setTitle(`**${GiveawayData.prize}**`)
        .setDescription(
          `Ends: <t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:R> (<t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:f>)\nHosted by: <@${GiveawayData.hostId}>\nEntries: **${GiveawayData.entryCount
          }**\nWinners: **${GiveawayData.winnersCount}**`
        )
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    }
  }

  async  fetchMessageByApi(client, channelId, messageId) {
    try {
      
      const response = await client.rest.get(`/channels/${channelId}/messages/${messageId}`);
      
      const message = new Message(client, response, client.channels.cache.get(channelId));
      
      return message;
    } catch (error) {
      if (error?.message && error.message.includes('Unknown Message')) {
        console.log(`Message with ID ${messageId} no longer exists.`);
        return null; 
      }
 
      console.error("Error fetching message by API:", error);
      return null; 
    }
  }
  

  async checkGiveawayEnd(giveawayId) {
    const GiveawayData = await gwdata.findOne({ messageId: giveawayId });

    if (!GiveawayData || !GiveawayData.isActive) return;

    const channel = await this.client.channels.fetch(GiveawayData.channelId).catch(() => null);
    if (!channel) {
      console.log(`Channel with ID ${GiveawayData.channelId} no longer exists. Deleting giveaway.`);
      await GiveawayData.deleteOne();
      return;
    }

    try {

      const message = await this.fetchMessageByApi(this.client, GiveawayData.channelId, GiveawayData.messageId);

      if (!message) {
        console.log(`Message with ID ${GiveawayData.messageId} no longer exists. Deleting giveaway.`);
        await GiveawayData.deleteOne();
        console.log("Deleted giveaway document successfully.");
        return;
      }

      const currentTime = Date.now();
      if (currentTime >= GiveawayData.endTime) {
        GiveawayData.isActive = false;
        await GiveawayData.save();

        await this.endGiveawayEmbed(giveawayId, GiveawayData);
      }
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  }

  async endGiveawayEmbed(giveawayId, GiveawayData) {
    const channel = await this.client.channels.fetch(GiveawayData.channelId);
    const message = await channel.messages.fetch(giveawayId);
    const guildData = await data.findOne({ id: GiveawayData.id });
    const endTime = Date.now();
    GiveawayData.isActive = false;
    await GiveawayData.save();
    if (GiveawayData.participants.length === 0) {
      const embed = new EmbedBuilder()
        .setColor("#313338")
        .setTitle(`**${GiveawayData.prize}**`)
        .setDescription(
          `Ends: <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(
          endTime / 1000
        )}:f>)\nHosted by: <@${GiveawayData.hostId}>\nEntries: **${GiveawayData.entryCount
          }**\nWinners: `
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("giveawayEnded")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(guildData.giveawayEmoji)
          .setDisabled(true)
      );

      await message.edit({ embeds: [embed], components: [row] });

      await message.reply({
        content: `No valid entrants, so a winner could not be determined!`,
      });
    } else {
      const winnerIds = GiveawayData.participants
        .sort(() => Math.random() - 0.5)
        .slice(0, GiveawayData.winnersCount);

      const winnerMentions = winnerIds.map((id) => `<@${id}>`).join(", ");

      const embed = new EmbedBuilder()
        .setColor("#313338")
        .setTitle(`**${GiveawayData.prize}**`)
        .setDescription(
          `Ends: <t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:R> (<t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:f>)\nHosted by: <@${GiveawayData.hostId}>\nEntries: **${GiveawayData.entryCount
          }**\nWinners: **${winnerMentions}**`
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("giveawayEnded")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(guildData.giveawayEmoji)
          .setDisabled(true)
      );

      await message.edit({ embeds: [embed], components: [row] });

      await message.reply({
        content: `Congratulations ${winnerMentions}! You won **${GiveawayData.prize}**!`,
      });
    }
  }

  async rerollGiveawayEmbed(giveawayId, GiveawayData) {
    const channel = await this.client.channels.fetch(GiveawayData.channelId);
    const message = await channel.messages.fetch(giveawayId);
    const guildData = await data.findOne({ id: GiveawayData.id });
    await GiveawayData.save();
    if (GiveawayData.participants.length === 0) {
      const embed = new EmbedBuilder()
        .setColor("#313338")
        .setTitle(`**${GiveawayData.prize}**`)
        .setDescription(
          `Ends: <t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:R> (<t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:f>)\nHosted by: <@${GiveawayData.hostId}>\nEntries: **${GiveawayData.entryCount
          }**\nWinners: `
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("giveawayEnded")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(guildData.giveawayEmoji)
          .setDisabled(true)
      );

      await message.edit({ embeds: [embed], components: [row] });

      await message.reply({
        content: `No valid entrants, so a winner could not be determined!`,
      });
    } else {
      const winnerIds = GiveawayData.participants
        .sort(() => Math.random() - 0.5)
        .slice(0, GiveawayData.winnersCount);

      const winnerMentions = winnerIds.map((id) => `<@${id}>`).join(", ");

      const embed = new EmbedBuilder()
        .setColor("#313338")
        .setTitle(`**${GiveawayData.prize}**`)
        .setDescription(
          `Ends: <t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:R> (<t:${Math.floor(
            GiveawayData.endTime / 1000
          )}:f>)\nHosted by: <@${GiveawayData.hostId}>\nEntries: **${GiveawayData.entryCount
          }**\nWinners: **${winnerMentions}**`
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("giveawayEnded")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(guildData.giveawayEmoji)
          .setDisabled(true)
      );

      await message.edit({ embeds: [embed], components: [row] });

      await message.reply({
        content: `Rerolled the giveaway! New winner(s) are ${winnerMentions}!`,
      });
    }
  }

  async parseDuration(duration) {
    duration = duration.trim();

    const timeRegex = /^(\d+)(s|m|h|d)$/;
    const match = duration.match(timeRegex);

    if (!match) {
      console.log(`Invalid duration value: ${duration}`);
      return null;
    }

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return amount; // seconds
      case "m":
        return amount * 60; // minutes to seconds
      case "h":
        return amount * 3600; // hours to seconds
      case "d":
        return amount * 86400; // days to seconds
      default:
        return null; // invalid unit
    }
  }

  /**
    *
    * @param {import("discord.js").Interaction | import("discord.js").Message} context
    * @param {Array<EmbedBuilder>} embeds
    */

  async paginate(context, embeds) {
    let currentPage = 0;
    const message =
      context instanceof Message ? await context.channel.send({
        embeds: [
          embeds[currentPage]
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setCustomId("1")
              .setEmoji({ name: "⏮️" })
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setCustomId("2")
              .setEmoji({ name: "⏪" })
              .setDisabled(true),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setCustomId("3")
              .setEmoji({ name: "⏩" }),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setCustomId("4")
              .setEmoji({ name: "⏭️" })
          ),
        ],
      })
        : await context.followUp({
          embeds: [
            embeds[currentPage]
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("1")
                .setEmoji({ name: "⏮️" })
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("2")
                .setEmoji({ name: "⏪" })
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("3")
                .setEmoji({ name: "⏩" }),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("4")
                .setEmoji({ name: "⏭️" })
            ),
          ],
        });
    const collector = message.createMessageComponentCollector({
      time: 300000,
      filter: ({ member: { id: memberId } }) => memberId === context.member.id,
    });
    collector.on("collect",
      /**
       * 
       * @param {import('discord.js').ButtonInteraction} interaction
       * @returns 
       */
      async (interaction) => {
        switch (interaction.customId) {
          case "1": {
            await interaction.deferUpdate();
            currentPage = 0;
            return message.edit({
              embeds: [
                embeds[currentPage]
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("1")
                    .setEmoji({ name: "⏮️" })
                    .setDisabled(true),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("2")
                    .setEmoji({ name: "⏪" })
                    .setDisabled(true),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("3")
                    .setEmoji({ name: "⏩" }),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("4")
                    .setEmoji({ name: "⏭️" })
                ),
              ],
            });
          }
          case "2": {
            await interaction.deferUpdate();
            --currentPage;
            return message.edit({
              embeds: [
                embeds[currentPage]
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("1")
                    .setEmoji({ name: "⏮️" })
                    .setDisabled(currentPage === 0),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("2")
                    .setEmoji({ name: "⏪" })
                    .setDisabled(currentPage === 0),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("3")
                    .setEmoji({ name: "⏩" })
                    .setDisabled(false),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("4")
                    .setEmoji({ name: "⏭️" })
                    .setDisabled(false)
                ),
              ],
            });
          }
          case "3": {
            await interaction.deferUpdate();
            currentPage++;
            return message.edit({
              embeds: [
                embeds[currentPage]
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("1")
                    .setEmoji({ name: "⏮️" })
                    .setDisabled(false),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("2")
                    .setEmoji({ name: "⏪" })
                    .setDisabled(false),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("3")
                    .setEmoji({ name: "⏩" })
                    .setDisabled(currentPage === embeds.length - 1),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("4")
                    .setEmoji({ name: "⏭️" })
                    .setDisabled(currentPage === embeds.length - 1)
                ),
              ],
            });
          }
          case "4": {
            await interaction.deferUpdate();
            currentPage = embeds.length - 1;
            return message.edit({
              embeds: [
                embeds[currentPage]
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("1")
                    .setEmoji({ name: "⏮️" }),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("2")
                    .setEmoji({ name: "⏪" }),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("3")
                    .setEmoji({ name: "⏩" })
                    .setDisabled(true),
                  new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("4")
                    .setEmoji({ name: "⏭️" })
                    .setDisabled(true)
                ),
              ],
            });
          }
        }
      });
    collector.on("end", () => {
      return message
        .edit({
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("1")
                .setEmoji({ name: "⏮️" })
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("2")
                .setEmoji({ name: "⏪" })
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("3")
                .setEmoji({ name: "⏩" })
                .setDisabled(true),
              new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("4")
                .setEmoji({ name: "⏭️" })
                .setDisabled(true)
            ),
          ],
        })
        .catch(() => null);
    });
  }

}
module.exports = Util;
