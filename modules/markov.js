import logger from "../logger";
import { sendCaption } from "../captionGenerator";
import markov from "markov";
import sqlite3 from "sqlite3";

class Markov {
  constructor(client) {
    this.client = client;
    this.markovChains = {};

    // Initialize the DB
    this.db = new sqlite3.Database("database.sqlite");
    this.db.run("CREATE TABLE IF NOT EXISTS messages (message TEXT, author_id TEXT, channel_id TEXT)");

    const channels = client.channels.array().filter((c) => c.type == "text");
    logger.log("info", `Initializing markov chains for ${channels.length} channels`);
    for (var i = 0; i < channels.length; i++) {
      this.initializeMarkovChain(channels[i]);
    }

    client.on("message", (msg) => {
      if (msg.isMemberMentioned(this.client.user)) {
        const markovChain = this.markovChains[msg.channel.id];
        const message = markovChain.respond(msg.cleanContent, 5).join(" ");
        sendCaption(msg.channel, message, null);
      }
    });

    client.on("message", (msg) => {
      const markovChain = this.markovChains[msg.channel.id];
      this.db.run(`INSERT INTO messages (message, author_id, channel_id) VALUES ("${msg.cleanContent}", "${msg.author.id}", "${msg.channel.id}")`);
      if (markovChain) {
        markovChain.seed(msg.cleanContent);
      } else {
        this.initializeMarkovChain(msg.channel);
      }
    });


    logger.log("info", "Markov module initialized successfully");
  }


  initializeMarkovChain(channel) {
    logger.log("info", `Initializing markov chain for ${channel.name}`)
    this.markovChains[channel.id] = new markov(3);

    this.markovChains[channel.id].seed("Hello friends!");

    this.db.each(`SELECT message FROM messages WHERE channel_id = "${channel.id}"`, (err, row) => {
      this.markovChains[channel.id].seed(row.message);
    }, () => {
      logger.info("info", `Finished loading messages for markov chain for ${channel.name}`)
    });
  }
}

export default Markov;
