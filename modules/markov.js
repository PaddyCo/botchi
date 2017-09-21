import logger from "../logger";
import util from "util";
import { sendCaption } from "../captionGenerator";
import markov from "markov";

class Markov {
  constructor(client) {
    this.client = client;
    this.markovChains = {};

    const channels = client.channels.array().filter((c) => c.type == "text");
    logger.log("info", `Initializing markov chains for ${channels.length} channels`);
    for (var i = 0; i < channels.length; i++) {
      this.initializeMarkovChain(channels[i]);
    }

    client.on("message", (msg) => {
      if (msg.isMemberMentioned(this.client.user)) {
        const markovChain = this.markovChains[msg.channel.id];
        const message = markovChain.respond(msg.cleanContent, 10).join(" ");
        sendCaption(msg.channel, message, null);
      }
    });

    client.on("message", (msg) => {
      const markovChain = this.markovChains[msg.channel.id];
      if (markovChain) {
        markovChain.seed(msg.cleanContent);
      } else {
        this.initializeMarkovChain(msg.channel);
      }
    });

    client.on("message", (msg) => {
      if (msg.content == "!markov") {
        const markovChain = this.markovChains[msg.channel.id];
        const message = markovChain.fill(markovChain.pick(), 10).join(" ");
        sendCaption(msg.channel, message, null);
      }
    });

    logger.log("info", "Markov module initialized successfully");
  }


  initializeMarkovChain(channel) {
    logger.log("info", `Initializing markov chain for ${channel.name}`)
    const markovChain = new markov(2);
    return channel.fetchMessages({ limit: 100 })
      .then(messages => {
        const messagesArray = messages.array();
        for (let i = 0; i < messagesArray.length; i++) {
          if (!messagesArray[i].author.bot && !messagesArray[i].isMemberMentioned(this.client.user)) {
            markovChain.seed(messagesArray[i].cleanContent);
          }
        }
        this.markovChains[channel.id] = markovChain;
        return markovChain;
      });
  }
}

export default Markov;
