const { Events, ActivityType } = require("discord.js");
require('dotenv').config();

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`bot online | ${client.user.tag}`);
        client.user.setPresence({ activities: [{ name: process.env.Presence, type: ActivityType.Custom }], status: "dnd" });
    },
};