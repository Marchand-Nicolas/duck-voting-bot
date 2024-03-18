import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
} from "discord.js";
import { Duck } from "types/duck";
import getEmojiPairByDuckName from "./getEmojiPairByDuckName";

const generateDuckComponents = (
  client: Client,
  ducks: Duck[],
  scheduledVoteId: number | string
) => {
  const rows = [];
  for (let index = 0; index < ducks.length; index++) {
    const rowId = Math.floor(index / 5);
    if (!rows[rowId]) {
      const row = new ActionRowBuilder();
      rows.push(row);
    }
    const row = rows[rowId];
    const duck = ducks[index];
    const { head } = getEmojiPairByDuckName(client, duck.name);
    const button = new ButtonBuilder()
      .setCustomId(`vote:${duck.name}:${scheduledVoteId}`)
      .setLabel(duck.title)
      .setEmoji(head)
      .setStyle(ButtonStyle.Secondary);
    row.addComponents(button);
  }
  return rows;
};

export default generateDuckComponents;
