import Twit from "twit";
import logger from "../logger";
import util from "util";

class Twitter {
  constructor(client, twitterApiKey, twitterSecret) {
    this.client = client;
    this.twitterClient = new Twit({
      consumer_key:    twitterApiKey,
      consumer_secret: twitterSecret,
      app_only_auth:   true,
    });

    client.on("message", this.expandGalleries.bind(this));

    logger.log("info", "Twitter module initialized successfully");
  }

  expandGalleries(msg) {
    const pattern = /(?:http[s]?:\/\/)?(?:www\.)?twitter.com\/.*?\/status\/([0-9]*)/;
    const matches = pattern.exec(msg.content);

    if (matches != null) {
      this._getTweet(matches[1])
        .then((result) => {
          const media = result.data.extended_entities.media;
          if (media.length > 1) {
            const messages = media.splice(1, 100).map((m) => m.media_url_https);
            for (const message of messages) {
              msg.channel.send(message);
            }
          }
        });
    }
  }

  _getTweet(id) {
    return this.twitterClient.get("statuses/show", { id, trim_user: 1, tweet_mode: "extended" })
      .then((result) => {
        if (result.data.errors != null) {
          return Promise.reject(util.inspect(result.data.errors));
        }

        return result;
      })
      .catch((error) => logger.log("error", `Could not get tweet: ${error}`));
  }
}

export default Twitter;
