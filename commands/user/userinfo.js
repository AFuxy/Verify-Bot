const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user.')
        .addUserOption(option => option.setName('user').setDescription('The user to get information about.')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const serverId = interaction.guildId;
        const data = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        // const votesData = JSON.parse(fs.readFileSync("./votes.json", "utf8"));
        const embed = new EmbedBuilder()
            .setTitle(" > User Information")
            .setColor("Purple")
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: "Username", value: user.username },
                { name: "User ID", value: user.id },
                { name: "Rank", value: client.guilds.cache.get(serverId).roles.cache.get(data[user.id].rank).name }
            )
            // if(votesData[user.id] && votesData[user.id].voteCount) embed.addFields({ name: "Votes", value: votesData[user.id].voteCount.toString() });
            if(data[user.id] && data[user.id].joinDate) embed.addFields({ name: "Joined", value: new Date(data[user.id].joinDate).toDateString() });
        await interaction.reply({ embeds: [embed] });
    }
};