import { exec } from "child_process";
import uuid from "uuid/v1";
import logger from "./logger";

const captionImages = require("./images.json");

export const sendCaption = (channel, text, tag = null) => {
  generateCaption(text, tag, uuid(), (name) => {
    channel.sendFile(name).then(() => {
      exec(`rm ${name}`); // I live life on the edge!
    });
  });
}

export const generateCaption = (text, tag, name, callback) => {
  const images = tag ? captionImages.filter((image) => image.tags.indexOf(tag) > -1) : captionImages;
  const image = images[Math.floor(Math.random()*images.length)];


  const cmd = `
      convert ${image.path} \
      \\( \
        -background none \
        -font ${process.env.CAPTION_FONT_FAMILY} \
        -fill black \
        -size ${image.captionWidth}x${image.captionHeight} \
        -gravity center \
        caption:"${text.replace(/(["\s'$`\\])/g,"\\$1")}" \
      \\) \
      -geometry +${image.captionX}+${image.captionY} \
      -gravity northwest \
      -composite \
      tmp/${name}.jpg
    `;

  exec(cmd, (error) => {
    if (error) {
      logger.log("error", `caption generation error: ${error}`);
      return;
    }

    callback(`tmp/${name}.jpg`);
  });
};
