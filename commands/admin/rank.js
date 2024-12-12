const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('List of commands that can be used to update the bot settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('up')
                .setDescription('Rank up a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to rank up')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('down')
                .setDescription('Rank down a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to rank down')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const serverId = interaction.guildId;
        const data = JSON.parse(fs.readFileSync("./users.json", "utf8"));

        // check if the user has permission to use the command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        }

        if (subCommand === 'up') {
            if (data[user.id] && data[user.id].rank == process.env.NewUserRoleID){
                data[user.id].rank = process.env.UserRoleID;
                await interaction.guild.members.cache.get(user.id).roles.remove(process.env.NewUserRoleID);
                await interaction.guild.members.cache.get(user.id).roles.add(process.env.UserRoleID);
            }else if (data[user.id] && data[user.id].rank == process.env.UserRoleID){
                data[user.id].rank = process.env.KnownUserRoleID;
                await interaction.guild.members.cache.get(user.id).roles.remove(process.env.UserRoleID);
                await interaction.guild.members.cache.get(user.id).roles.add(process.env.KnownUserRoleID);
            }else if (data[user.id] && data[user.id].rank == process.env.KnownUserRoleID){
                data[user.id].rank = process.env.TrustedUserRoleID;
                await interaction.guild.members.cache.get(user.id).roles.remove(process.env.KnownUserRoleID);
                await interaction.guild.members.cache.get(user.id).roles.add(process.env.TrustedUserRoleID);
            }else {
                const embed = new EmbedBuilder()
                    .setTitle(" > Rank max!")
                    .setColor("Red")
                    .setTimestamp()
                    .setDescription(`The user \`${user.tag}\` already has the highest rank!`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            fs.writeFileSync("./users.json", JSON.stringify(data, null, 4));
            const embed = new EmbedBuilder()
                .setTitle(" > Rank Up")
                .setColor("Green")
                .setTimestamp()
                .setDescription(`The user \`${user.tag}\` has been ranked up! to ${client.guilds.cache.get(serverId).roles.cache.get(data[user.id].rank).name}`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subCommand === 'down') {
            if (data[user.id] && data[user.id].rank == process.env.TrustedUserRoleID){
                data[user.id].rank = process.env.KnownUserRoleID;
                await interaction.guild.members.cache.get(user.id).roles.remove(process.env.TrustedUserRoleID);
                await interaction.guild.members.cache.get(user.id).roles.add(process.env.KnownUserRoleID);
            }else if (data[user.id] && data[user.id].rank == process.env.KnownUserRoleID){
                data[user.id].rank = process.env.UserRoleID;
                await interaction.guild.members.cache.get(user.id).roles.remove(process.env.KnownUserRoleID);
                await interaction.guild.members.cache.get(user.id).roles.add(process.env.UserRoleID);
            }else if (data[user.id] && data[user.id].rank == process.env.UserRoleID){
                data[user.id].rank = process.env.NewUserRoleID;
                await interaction.guild.members.cache.get(user.id).roles.remove(process.env.UserRoleID);
                await interaction.guild.members.cache.get(user.id).roles.add(process.env.NewUserRoleID);
            }else {
                const embed = new EmbedBuilder()
                    .setTitle(" > Rank min!")
                    .setColor("Red")
                    .setTimestamp()
                    .setDescription(`The user \`${user.tag}\` already has the lowest rank!`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            fs.writeFileSync("./users.json", JSON.stringify(data, null, 4));
            const embed = new EmbedBuilder()
                .setTitle(" > Rank Down")
                .setColor("Green")
                .setTimestamp()
                .setDescription(`The user \`${user.tag}\` has been ranked down! to ${client.guilds.cache.get(serverId).roles.cache.get(data[user.id].rank).name}`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};