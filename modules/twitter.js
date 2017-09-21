import Discord from "discord.js";
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

    client.on("message", this._expandGalleries.bind(this));
    client.on("message", this._expandQuote.bind(this));

    logger.log("info", "Twitter module initialized successfully");
  }

  _expandQuote(msg) {
    const tweetId = this._getTweetId(msg.content);

    if (tweetId != null) {
      this._getTweet(tweetId)
        .then((result) => {
          const quotedId = result.data.quoted_status_id_str;
          if (quotedId) {
            msg.channel.send(`:arrow_right: Response to https://twitter.com/statuses/${quotedId}`)
          }
        });
    }
  }

  _expandGalleries(msg) {
    const tweetId = this._getTweetId(msg.content);

    if (tweetId != null) {
      this._getTweet(tweetId)
        .then((result) => {
          const media = result.data.extended_entities ? result.data.extended_entities.media : [];
          if (media.length > 1) {
            const images = media.splice(1, 100).map((m) => m.media_url_https);
            // This is the best way I can think of to make sure images preserve their order
            for (const image of images) {
              msg.channel.send({
                embed: {
                  image: {
                    url: image
                  }
                }
              });
            }
          }
        });
    }
  }

  _getTweetId(string) {
    const pattern = /(?:http[s]?:\/\/)?(?:www\.)?twitter.com\/.*?\/status\/([0-9]*)/;
    const matches = pattern.exec(string)
      return matches ? matches[1] : null;
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
