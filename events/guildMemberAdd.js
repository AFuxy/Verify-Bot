const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

client.on("guildMemberAdd", async (member) => {

    // check if the user has already been denied and kick and send embed message
    const data = JSON.parse(fs.readFileSync("./users.json"));
    if (data[member.id] && data[member.id].denied) {
        await member.kick();
        const embed = new EmbedBuilder()
        .setTitle(" > User Denied")
        .setColor("Red")
        .setTimestamp()
        .setDescription(`The user \`${member.user.tag}\` was denied from joining the server`)
        .setThumbnail(member.user.avatarURL());
        await client.channels.cache.get(process.env.VerifyChannelID).send({ embeds: [embed] });
        return;
    }

    // check if the user already has any rank that is not the VisitorRoleID and return if so
    if (data[member.id] && data[member.id].rank != process.env.VisitorRoleID) return;

    const embed = new EmbedBuilder()
    .setTitle(" > User Joined")
    .setColor("Purple")
    .setTimestamp()
    .setDescription(`The user \`${member.user.tag}\` joined the server\nBOB!!!, get your vote in!`)
    .setThumbnail(member.user.avatarURL());

    // add two buttons for Deny and Approve
    const Deny =new ButtonBuilder()
            .setCustomId("deny-" + member.id)
            .setLabel("Deny")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🚫");
    const Approve = new ButtonBuilder()
            .setCustomId("approve-" + member.id)
            .setLabel("Approve")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅");
    const row = new ActionRowBuilder().addComponents(Deny, Approve);

    try {
        await client.channels.cache.get(process.env.VerifyChannelID).send({ embeds: [embed], components: [row] });
        const data = JSON.parse(fs.readFileSync("./users.json"));
        data[member.id] = { rank: process.env.VisitorRoleID, joinDate: member.joinedAt, denied: false };
        fs.writeFileSync("./users.json", JSON.stringify(data, null, 4));
    } catch (error) {
        console.log(error)
    }
})