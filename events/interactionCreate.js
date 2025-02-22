const { Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isCommand() && !interaction.isButton() && !interaction.isModalSubmit() && !interaction.isContextMenu()) return;

        if (interaction.isCommand()) {
            try{
                await client.commands.get(interaction.commandName).execute(interaction);
            }catch(err){
                console.log(`Command: ${interaction.commandName}, run by: ${interaction.user.tag} failed for the reason: ${err}`);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            try{
                const data = JSON.parse(fs.readFileSync("./votes.json"));
                const serverConfig = JSON.parse(fs.readFileSync("./settings.json"));
                // check if user has the staff role
                if (!interaction.member.roles.cache.has(serverConfig[interaction.guild.id].voterole)) {
                    const embed = new EmbedBuilder()
                        .setTitle(" > Vote Denied")
                        .setColor("Red")
                        .setTimestamp()
                        .setDescription(`You do not have the correct perms to use this button.`)
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }
                // parse the customId and put them into variables
                const split = interaction.customId.split("-");
                const interactionType = split[0];
                const memberId = await client.users.fetch(split[1]).catch(error => console.log(error));
                if (!data[memberId.id]) {
                    data[memberId.id] = {};
                    data[memberId.id].accepted = [];
                    data[memberId.id].denied = [];
                    data[memberId.id].voteCount = 0;
                }
                if (data[memberId.id].voteCount >= serverConfig[interaction.guild.id].votelimit) {
                    const embed = new EmbedBuilder()
                        .setTitle(" > Vote Denied")
                        .setColor("Red")
                        .setTimestamp()
                        .setDescription(`The user \`${memberId.tag}\` has reached the vote limit of ${serverConfig[interaction.guild.id].votelimit}`)

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }
                // when the accept button is pressed the users id from the customId is stored in the vote.json file
                if (interactionType.startsWith("A")) {
                    // check if memberId is already in the field if not add them then up the vote count by 1 in the accepted field
                    if (!data[memberId.id].accepted.includes(interaction.user.id) && !data[memberId.id].denied.includes(interaction.user.id)) {
                        data[memberId.id].accepted.push(interaction.user.id);
                        data[memberId.id].voteCount++;
                        const embed = new EmbedBuilder()
                            .setTitle(" > Vote Accepted")
                            .setColor("Green")
                            .setTimestamp()
                            .setDescription(`Vote for \`${memberId.tag}\` added to accepted list`)

                        await interaction.reply({ embeds: [embed], ephemeral: true });

                        const embed2 = new EmbedBuilder()
                            .setTitle(" > Vote Updated")
                            .setColor("Purple")
                            .setTimestamp()
                            .setDescription(`Votes are now at ${data[memberId.id].voteCount}/${serverConfig[interaction.guild.id].votelimit}\nFor user: \`${memberId.tag}\``)

                        await interaction.guild.channels.cache.get(serverConfig[interaction.guild.id].logchannel).send({ embeds: [embed2] });
                    }else{
                        const embed = new EmbedBuilder()
                            .setTitle(" > Vote Denied")
                            .setColor("Red")
                            .setTimestamp()
                            .setDescription(`You have already voted for this user`)

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                    fs.writeFileSync("./votes.json", JSON.stringify(data, null, 4));

                // when the deny button is pressed the users id from the customId is stored in the vote.json file
                }else if (interactionType.startsWith("D")) {
                    // check if memberId is already in the field if not add them then up the vote count by 1 in the denied field
                    if (!data[memberId.id].denied.includes(interaction.user.id) && !data[memberId.id].accepted.includes(interaction.user.id)) {
                        data[memberId.id].denied.push(interaction.user.id);
                        data[memberId.id].voteCount++;
                        const embed = new EmbedBuilder()
                            .setTitle(" > Vote Accepted")
                            .setColor("Green")
                            .setTimestamp()
                            .setDescription(`Vote for \`${memberId.tag}\` added to denied list`)

                        await interaction.reply({ embeds: [embed], ephemeral: true });

                        const embed2 = new EmbedBuilder()
                            .setTitle(" > Vote Updated")
                            .setColor("Purple")
                            .setTimestamp()
                            .setDescription(`Votes are now at ${data[memberId.id].voteCount}/${serverConfig[interaction.guild.id].votelimit}\nFor user: \`${memberId.tag}\``)

                        await interaction.guild.channels.cache.get(serverConfig[interaction.guild.id].logchannel).send({ embeds: [embed2] });
                    }else{
                        const embed = new EmbedBuilder()
                            .setTitle(" > Vote Denied")
                            .setColor("Red")
                            .setTimestamp()
                            .setDescription(`You have already voted for this user`)

                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                    fs.writeFileSync("./votes.json", JSON.stringify(data, null, 4));
                }
                // check to see if max votes have been reached
                if (data[memberId.id].voteCount >= serverConfig[interaction.guild.id].votelimit) {
                    // if true check how many users voted for denied and how many voted accept
                    const denied = data[memberId.id].denied.length;
                    const accepted = data[memberId.id].accepted.length;
                    // if denied is greater than accepted kick the user and update users.json "denied" value to true
                    if (denied > accepted) {
                        const user = JSON.parse(fs.readFileSync("./users.json"));
                        user[memberId.id].denied = true;
                        fs.writeFileSync("./users.json", JSON.stringify(user, null, 4));
                        const embed = new EmbedBuilder()
                            .setTitle(" > User Denied")
                            .setColor("Red")
                            .setTimestamp()
                            .setDescription(`The user \`${memberId.tag}\` was kicked and denied from joining the server`)

                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({ embeds: [embed] });
                        } else {
                            await interaction.reply({ embeds: [embed] });
                        }
                        await client.guilds.cache.get(interaction.guildId).members.cache.get(memberId.id).kick();
                    } else if (accepted > denied) {
                        // if accepted is greater than denied update users.json rank to NewUserRoleID and update the users role
                        const user = JSON.parse(fs.readFileSync("./users.json"));
                        user[memberId.id].rank = process.env.NewUserRoleID;
                        fs.writeFileSync("./users.json", JSON.stringify(user, null, 4));
                        await client.guilds.cache.get(interaction.guildId).members.cache.get(memberId.id).roles.add(process.env.NewUserRoleID);
                        await client.guilds.cache.get(interaction.guildId).members.cache.get(memberId.id).roles.remove(process.env.VisitorRoleID);
                        const embed = new EmbedBuilder()
                            .setTitle(" > User Accepted")
                            .setColor("Green")
                            .setTimestamp()
                            .setDescription(`The user \`${memberId.tag}\` has been given the rank of \`${interaction.guild.roles.cache.get(process.env.NewUserRoleID).name}\``)

                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({ embeds: [embed] });
                        } else {
                            await interaction.reply({ embeds: [embed] });
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setTitle(" > Stalemate")
                            .setColor("Yellow")
                            .setTimestamp()
                            .setDescription(`Seems it was an equal split in votes for \`${memberId.tag}\` OR some other mystery issue happened\n Discuss next steps ¯\\_(ツ)_/¯`)

                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({ embeds: [embed] });
                        } else {
                            await interaction.reply({ embeds: [embed] });
                        }
                    }
                }
            }catch(err){
                console.log(`Command: button press, run by: ${interaction.user.tag} failed for the reason: ${err}`);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    }
}