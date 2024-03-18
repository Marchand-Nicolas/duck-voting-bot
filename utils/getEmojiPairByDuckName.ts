import { Client } from "discord.js";
import getAvailableEmojis from "./getAvailableEmojis";

const getEmojiPairByDuckName = (client: Client, duckName: string) => {
  const emojis = getAvailableEmojis(client);
  const head = emojis.find((emoji) => emoji.split(":")[1] === duckName);
  const body = emojis.find(
    (emoji) => emoji.split(":")[1] === duckName + "_body"
  );
  return {
    head: head || "🦆",
    body: body || "⭐",
  };
};

export default getEmojiPairByDuckName;
