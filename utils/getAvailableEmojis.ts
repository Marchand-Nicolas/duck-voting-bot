import { Client } from "discord.js";

const getAvailableEmojis = (client: Client) => {
  const emojiGuildId = process.env.EMOJI_GUILD_ID;
  if (!emojiGuildId) return [];
  const guild = client.guilds.cache.get(emojiGuildId);
  if (!guild) return [];
  const emojis = guild.emojis.cache.map((emoji) => emoji.toString());
  return emojis;
};

export default getAvailableEmojis;
