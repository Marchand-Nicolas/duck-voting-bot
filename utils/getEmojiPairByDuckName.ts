import { Client } from "discord.js";
import getAvailableEmojis from "./getAvailableEmojis";
import convertDuckNameToId from "./convertDuckNameToId";

const getEmojiPairByDuckName = (client: Client, duckName: string) => {
  const emojis = getAvailableEmojis(client);
  const head = emojis.find(
    (emoji) => emoji.split(":")[1] === convertDuckNameToId(duckName)
  );
  const body = emojis.find(
    (emoji) => emoji.split(":")[1] === duckName + "_body"
  );
  return {
    head: head || "🦆",
    body: body || "⭐",
  };
};

export default getEmojiPairByDuckName;
