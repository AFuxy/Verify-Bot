const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('List of commands that can be used to update the bot settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('votelimit')
                .setDescription('Set the vote limit')
                .addIntegerOption(option =>
                    option
                        .setName('limit')
                        .setDescription('How many staff must vote to pass/deny a user')
                        .setRequired(true)
                        .setMaxValue(10)
                        .setMinValue(1)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('staffrole')
                .setDescription('Set the staff role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role the bot will consider a staff member')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const serverId = interaction.guildId;
        const serverConfig = JSON.parse(fs.readFileSync("./settings.json"));

        // check if the user has permission to use the command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        }

        // Check if server is in the settings.json file
        if (!serverConfig[serverId]) {
            serverConfig[serverId] = {};
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
        }

        const embed = new EmbedBuilder()
        .setTitle(" > Settings updated")
        .setColor("Purple")
        .setTimestamp()

        if (subCommand === 'votelimit') {
            const limit = interaction.options.getInteger('limit');
            serverConfig[serverId].votelimit = limit;
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
            embed.addFields({ name: "Vote Limit", value: limit.toString() });
        }

        if (subCommand === 'staffrole') {
            const role = interaction.options.getRole('role');
            serverConfig[serverId].staffrole = role.id;
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
            embed.addFields({ name: "Staff Role", value: role.name });
        }

        await interaction.reply({ embeds: [embed] });
    }
}