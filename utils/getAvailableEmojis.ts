import { Client } from "discord.js";

const getAvailableEmojis = async (client: Client) => {
  const emojiGuildId = process.env.EMOJI_GUILD_ID;
  if (!emojiGuildId) return [];
  const fetchedGuild = await client.guilds.fetch(emojiGuildId);
  if (!fetchedGuild) return [];
  const rowEmojis = await fetchedGuild.emojis.fetch();
  const emojis =
    rowEmojis.map(
      (emoji) => `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`
    ) || ``;
  console.log(emojis);
  return emojis;
};

export default getAvailableEmojis;
