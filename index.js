const { EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, Events, Modal, TextInputBuilder, OAuth2Scopes, Partials, resolveColor, Client, Collection, GatewayIntentBits, SelectMenuBuilder, ActivityType, PermissionsBitField, AttachmentBuilder } = require("discord.js");
const { exit } = require("process");
const fs = global.fs = require("node:fs");
const path = require('node:path');
const client = global.client = new Client({ fetchAllMembers: true, intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent], scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands], partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.ThreadMember, Partials.GuildScheduledEvent], ws: { version: "10" } });
const wait = require("timers/promises").setTimeout;
require('dotenv').config();



// check if all "DB" files exist if not create them
if (!fs.existsSync("./settings.json")) {
	console.log("settings.json not found, creating...");
	fs.writeFileSync("./settings.json", "{}");
}
if (!fs.existsSync("./users.json")) {
	console.log("users.json not found, creating...");
	fs.writeFileSync("./users.json", "{}");
}
if (!fs.existsSync("./votes.json")) {
	console.log("votes.json not found, creating...");
	fs.writeFileSync("./votes.json", "{}");
}

// Soft check for .env file, exit if does not exist
if (!fs.existsSync("./.env")) {
	console.log(".env not found, please create one using the .env.example file.")
	exit();
}

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
		console.log("Commands: " + command.data.name);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	console.log("Events: " + event.name);
}

setInterval(() => {
	const date = new Date();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const GuildID = process.env.GuildID;
	const serverConfig = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
	if (month === 10 && day >= 1 && day <= 31) {
		if (serverConfig[GuildID].seasonpfpscurrent !== "halloween") {
			serverConfig[GuildID].seasonpfpscurrent = "halloween";
			fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
			if (serverConfig[GuildID].seasonpfps["halloween"]) {
				client.guilds.cache.get(process.env.GuildID).setIcon(`./cdn/${GuildID}/halloween.png`);
				console.log("Season Icon set to Halloween");
			}
		}
	} else if (month === 12 && day >= 1 && day <= 31) {
		if (serverConfig[GuildID].seasonpfpscurrent !== "christmas") {
			serverConfig[GuildID].seasonpfpscurrent = "christmas";
			fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
			if (serverConfig[GuildID].seasonpfps["christmas"]) {
				client.guilds.cache.get(process.env.GuildID).setIcon(`./cdn/${GuildID}/christmas.png`);
				console.log("Season Icon set to Christmas");
			}
		}
	} else if (month === 3 && day >= 1 && day <= 31) {
		if (serverConfig[GuildID].seasonpfpscurrent !== "easter") {
			serverConfig[GuildID].seasonpfpscurrent = "easter";
			fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
			if (serverConfig[GuildID].seasonpfps["easter"]) {
				client.guilds.cache.get(process.env.GuildID).setIcon(`./cdn/${GuildID}/easter.png`);
				console.log("Season Icon set to Easter");
			}
		}
	} else {
		if (serverConfig[GuildID].seasonpfpscurrent !== "default") {
			serverConfig[GuildID].seasonpfpscurrent = "default";
			fs.writeFileSync("./settings.json", JSON.stringify(serverConfig, null, 4));
			if (serverConfig[GuildID].seasonpfps["default"]) {
				client.guilds.cache.get(process.env.GuildID).setIcon(`./cdn/${GuildID}/default.png`);
				console.log("Season Icon Reset");
			}
		}
	}
}, 1000 * 60 * 60);


client.login(process.env.Token);