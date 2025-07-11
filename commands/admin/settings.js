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
        .addSubcommand(subcommand =>
            subcommand
                .setName('voterole')
                .setDescription('Set the role that can vote')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role that can vote')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('nsfwrole')
                .setDescription('Set the nsfw role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The nsfw role')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('logchannel')
                .setDescription('Set the log channel')
                .addChannelOption(option => 
                    option
                        .setName('channel')
                        .setDescription('The log channel')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('adduserdb')
                .setDescription('Add a user to the database')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to add')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The current highest trust role of the user')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('verifcation')
                .setDescription('Enable/Disable Verification')
                .addBooleanOption(option =>
                    option
                        .setName('enable')
                        .setDescription('Enable/Disable Verification')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const serverId = interaction.guildId;
        const serverConfig = JSON.parse(fs.readFileSync("./settings.json"));

        // check if user has the staff role
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

        if (subCommand === 'voterole') {
            const role = interaction.options.getRole('role');
            serverConfig[serverId].voterole = role.id;
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
            embed.addFields({ name: "Vote Role", value: role.name });
        }

        if (subCommand === 'nsfwrole') {
            const role = interaction.options.getRole('role');
            serverConfig[serverId].nsfwrole = role.id;
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
            embed.addFields({ name: "NSFW Role", value: role.name });
        }

        if (subCommand === 'logchannel') {
            const channel = interaction.options.getChannel('channel');
            serverConfig[serverId].logchannel = channel.id;
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
            embed.addFields({ name: "Log Channel", value: channel.name });
        }

        if (subCommand === 'adduserdb') {
            const user = interaction.options.getUser('user');
            const data = JSON.parse(fs.readFileSync("./users.json"));
            data[user.id] = {
                rank: interaction.options.getRole('role').id,
                joinDate: user.joinedAt,
                nsfw: false,
                denied: false,
            };
            fs.writeFileSync("./users.json", JSON.stringify(data, null, 4));
            embed.addFields({ name: "User added to database", value: user.tag });
        }

        if (subCommand === 'verifcation') {
            const enable = interaction.options.getBoolean('enable');
            serverConfig[serverId].verification = enable;
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
            embed.addFields({ name: "Verification", value: enable.toString() });
        }

        await interaction.reply({ embeds: [embed] });
    }
}