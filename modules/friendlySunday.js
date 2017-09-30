import logger from "../logger";
import { inspect } from "util";
import { sendCaption } from "../captionGenerator";
import cron from "node-cron";
import sqlite3 from "sqlite3";
import { sample } from "lodash";

// Try to be nice in general, but make extra sure you are nice on friendly sunday!
class FriendlySunday {
  constructor(client) {
    this.client = client;
    this.channels = [];

    // Initialize the DB
    this.db = new sqlite3.Database("database.sqlite");
    this.db.run("CREATE TABLE IF NOT EXISTS friendly_sunday_channels (name TEXT, id TEXT UNIQUE)");
    this.db.each("SELECT id FROM friendly_sunday_channels", (err, row) => {
      if (err) {
        logger.log("error", err);
        return false;
      }

      this.channels.push(this.client.channels.find("id", row.id));
    });

    // Schedule friendly sunday announcments
    cron.schedule("0 0 * * 0", () => { this._sundayStart(); });
    cron.schedule("0 0 * * 1", () => { this._sundayEnd(); });

    client.on("message", this._registerChannel.bind(this));

    logger.log("info", "FriendlySunday module initialized successfully");
  }

  _registerChannel(msg) {
    if (msg.content.indexOf("!friendlysunday") == 0 && this.channels.indexOf(msg.channel) == -1) {
      this.db.run(`INSERT INTO friendly_sunday_channels (name, id) VALUES ("${msg.channel.name}", "${msg.channel.id}")`);
      this.channels.push(msg.channel);
      sendCaption(msg.channel, `#${msg.channel.name} now observes friendly sunday!`, "excited");
    }
  }

  _sundayStart() {
    logger.log("info", "Friendly monday has started");
    for (const channel of this.channels) {
      const start = [
        "Friendly\\nsunday\\nhas begun!",
        "Friendly\\nsunday\\nis here!",
        "Friendly\\nsunday\\nis finally here!"
      ];

      const end = [
        "",
        "Let's be nice!",
        "Let's be friends!",
        "No more bullying!"
      ];

      sendCaption(channel, `${sample(start)}\\n${sample(end)}`, "positive");
    }
  }

  _sundayEnd() {
    logger.log("info", "Friendly sunday has ended");
    for (const channel of this.channels) {
      const start = [
        "Friendly\\nsunday\\nhas ended!",
        "Friendly\\nsunday\\nis over...",
        "Friendly\\nsunday\\nis already over"
      ];

      const end = [
        "",
      ];

      sendCaption(channel, `${sample(start)} ${sample(end)}`, "scared");
    }
  }
}

export default FriendlySunday;
