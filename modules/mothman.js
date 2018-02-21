import logger from "../logger";
import { sample } from "lodash";
import { sendCaption } from "../captionGenerator";

class Mothman {
  constructor(client) {
    this.client = client;

    client.on("message", (msg) => {
      const undercase_msg = msg.toString().toLowerCase();
      if (undercase_msg.indexOf("botchi") > -1 && undercase_msg.indexOf("mothman") > -1) {
        const start = [
          "Mothman!?",
          "Mothman!",
          "Waaaaahh!!"
        ];

        const end = [
          "Where!?",
          "I'm leaving!",
        ];

        sendCaption(msg.channel, `${sample(start)} ${sample(end)}`, "crying");
      }
    });

    logger.log("info", "Mothman module initialized successfully");
  }
}

export default Mothman;
