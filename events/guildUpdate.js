const { Events } = require("discord.js");

module.exports = {
    name: Events.GuildUpdate,
    once: false,
    async execute(oldGuild, newGuild) {
        if(oldGuild.iconURL() != newGuild.iconURL() || oldGuild.name != newGuild.name) {
            client.user.setAvatar(newGuild.iconURL());
            client.guilds.cache.get(process.env.GuildID).members.cache.get(client.user.id).setNickname(newGuild.name+" bot");
            console.log("Profile Updated")
        }
    },
};