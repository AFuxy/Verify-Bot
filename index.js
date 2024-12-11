const { EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, Events, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { exit } = require("process");
const fs = global.fs = require("node:fs");
const client = global.client = new Client({ fetchAllMembers: true, intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands], partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.ThreadMember, Partials.GuildScheduledEvent], ws: { version: "10" } });
const wait = require("timers/promises").setTimeout;
require('dotenv').config();



var normalizedPathEvents = require("path").join(__dirname, "events");
var foldersPath = require("path").join(__dirname, "commands");

require("fs").readdirSync(normalizedPathEvents).forEach(function(file) {
  require("./events/" + file);
  console.log("Events: " + file);
});

const commandFolders = require("fs").readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = require("path").join(foldersPath, folder);
	const commandFiles = require("fs").readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = require("path").join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
      console.log("Commands: " + file);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on("ready", async () => {
  console.log(`bot online | ${client.user.tag}`);
  client.user.setPresence({ activities: [{ name: process.env.Presence, type: ActivityType.Custom }], status: "dnd" })
})

client.login(process.env.Token);