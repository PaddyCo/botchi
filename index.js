import Discord from "discord.js";
import Twitter from "./modules/twitter";
import FriendlySunday from "./modules/friendlySunday.js";
import logger from "./logger";

const client = new Discord.Client();

import { generateCaption } from "./captionGenerator";

client.on("ready", () => {
  logger.log("info", `Bot logged in as ${client.user.tag}`);
});

// Setup modules
new Twitter(client, process.env.TWITTER_API_KEY, process.env.TWITTER_SECRET);
new FriendlySunday(client);

client.on("message", (msg) => {
  if (msg.content.indexOf("!say") != 0) { return; }
  generateCaption(msg.content.replace("!say ", ""));
})

client.login(process.env.DISCORD_BOT_TOKEN);
