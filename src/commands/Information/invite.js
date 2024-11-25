module.exports = {
  name: "invite",
  description: "add the bot to your own server",

  run: async ({ client, context }) => {
    return await context.createMessage({
      content: `<:yay:1310201036732104746> Hello! I'm **GiveawayBot**! I help to make giveaways quick and easy!\nYou can add me to your server with this link:\n\n🔗 **https://discord.com/oauth2/authorize?permissions=347200&scope=bot+applications.commands&client_id=${client.user.id}**`,
    });
  },
};
