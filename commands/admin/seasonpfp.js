const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('node:fs');
const fetch = require('node-fetch');
const stream = require('node:stream');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seasonpfp')
        .setDescription('Set a seasonal server pfp')
        .addStringOption(option =>
            option
                .setName('season')
                .setDescription('The season to set the pfp for')
                .setRequired(true)
            .addChoices(
                { name: 'Default', value: 'default' },
                { name: 'Christmas', value: 'christmas' },
                { name: 'Halloween', value: 'halloween' },
                { name: 'Easter', value: 'easter' }
            )
        )
        .addAttachmentOption(option =>
            option
                .setName('pfp')
                .setDescription('The pfp to set')
                .setRequired(true)
        ),
    async execute(interaction) {
        const pfp = interaction.options.getAttachment('pfp');
        const season = interaction.options.getString('season');
        const serverId = interaction.guildId;
        const serverConfig = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        }

        if (!serverConfig[serverId]) {
            serverConfig[serverId] = {};
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
        }

        if (!serverConfig[serverId].seasonpfps) {
            serverConfig[serverId].seasonpfps = {};
            fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
        }

        // create folder under the servers ID if it doesn't exist
        if (!fs.existsSync(`./cdn/${serverId}`)) {
            fs.mkdirSync(`./cdn/${serverId}`);
        }

        // download the attachment and save it as the season
        // fetch(pfp.url)
        //     .then(res => {
        //         res.body.pipe(fs.createWriteStream(`./cdn/${serverId}/${season}.png`))
        //     });

        fetch(pfp.url)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
                }

                const dest = fs.createWriteStream(`./cdn/${serverId}/${season}.png`);

                // Use pipeline to handle streams
                stream.pipeline(res.body, dest, err => {
                    if (err) {
                        console.error('Pipeline failed:', err);
                    } else {
                        console.log('File downloaded successfully.');
                    }
                });
            })
            .catch(err => {
                console.error('Error downloading the file:', err);
            });

        serverConfig[serverId].seasonpfps[season] = true;
        fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));

        const embed = new EmbedBuilder()
            .setTitle(" > Seasonal PFP Set")
            .setColor("Purple")
            .setTimestamp()
            .setDescription(`The seasonal PFP for \`${season}\` has been set!`)
            .setThumbnail(`${pfp.url}`);

        await interaction.reply({ embeds: [embed] });
    }
}