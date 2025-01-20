const { EmbedBuilder } = require("discord.js");
const { inspect } = require('util');
new (require("./structures/Client"))().build();

process.removeAllListeners("warning");

process.on("unhandledRejection", async (err, promise) => {
  if (!String(err).includes("Unknown interaction") && !String(err).includes("Missing Access") && !String(err).includes("Missing Permissions") && !String(err).includes("Unknown Message") && !String(err).includes("InteractionAlreadyReplied") && !String(err).includes("Unknown Member")) {
    console.log("Unhandled Rejection:", err);
    console.log("Promise:", promise);
  }
});

process.on("uncaughtException", async (err, promise) => {
  if (!String(err).includes("Unknown interaction") && !String(err).includes("Missing Access") && !String(err).includes("Missing Permissions") && !String(err).includes("Unknown Message") && !String(err).includes("InteractionAlreadyReplied") && !String(err).includes("Unknown Member")) {
    console.log("Uncaught Exception:", err);
    console.log("Promise:", promise);
  }
});
