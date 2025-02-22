const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('List of commands that can be used to update the bot settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('upgrade')
                .setDescription('upgrade a users rank')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to upgrade')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('downgrade')
                .setDescription('downgrade a users rank')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to downgrade')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('nsfw')
                .setDescription('Give the NSFW role')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to give the nsfw role')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const serverId = interaction.guildId;
        const data = JSON.parse(fs.readFileSync("./users.json", "utf8"));
        const serverConfig = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

        // check if the user has permission to use the command or if the user has the staff role
        if (interaction.member.roles.cache.has(serverConfig[serverId].staffrole) || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {

        } else {
            return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        }


        if (subCommand === 'upgrade') {
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
        } else if (subCommand === 'downgrade') {
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
        } else if (subCommand === 'nsfw') {
            if(data[user.id] && (data[user.id].nsfw == undefined || data[user.id].nsfw == false)){
                data[user.id].nsfw = true;
                const embed = new EmbedBuilder()
                .setTitle(" > NSFW")
                .setColor("Green")
                .setTimestamp()
                .setDescription(`The user \`${user.tag}\` has had the NSFW role added!`);
                await interaction.guild.members.cache.get(user.id).roles.add(serverConfig[serverId].nsfwrole);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }else{
                data[user.id].nsfw = false;
                const embed = new EmbedBuilder()
                .setTitle(" > NSFW")
                .setColor("Red")
                .setTimestamp()
                .setDescription(`The user \`${user.tag}\` has had the NSFW role removed!`);
                await interaction.guild.members.cache.get(user.id).roles.remove(serverConfig[serverId].nsfwrole);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
            fs.writeFileSync("./users.json", JSON.stringify(data, null, 4));
        }
    }
};