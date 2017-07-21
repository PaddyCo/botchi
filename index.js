import Discord from "discord.js";
import expandTwitterGalleries from "./modules/expandTwitterGalleries.js";

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", expandTwitterGalleries);

client.login(process.env.DISCORD_BOT_TOKEN);
