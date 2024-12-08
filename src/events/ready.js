const { WebhookClient, PermissionFlagsBits, REST, Routes, ApplicationCommandType } = require('discord.js');
const db = require('../models/Guild');

/**
 * @param {import("../structures/Client")} client
 */

module.exports = async (client) => {
  console.log(`➜     Cluster #${client.cluster.id} is Online.`);
  if (client.cluster.id === 0) {
    const rest = new REST({ version: "10" }).setToken(client.token)
    let appCommand = [];
    client.commands.filter(({ category }) => category !== "Owner").map(({ description, name, options }) => {
      appCommand.push({
        name,
        description,
        options,
        type: ApplicationCommandType.ChatInput,
        dmPermission: false
      })
    })
    await rest.put(Routes.applicationCommands(client.user.id), { body: appCommand });
    client.rest = rest;
  }
};
