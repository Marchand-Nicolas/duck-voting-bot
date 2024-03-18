import { CommandInteraction } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";
import refreshMessage from "../utils/refreshMessage";

const addScheduledVote = async (interaction: CommandInteraction) => {
  if (typeof interaction.member?.permissions === "string") {
    await interaction.reply({
      content: "Bad permissions format",
      ephemeral: true,
    });
    return;
  }
  if (!interaction.member?.permissions.has("Administrator")) {
    await interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true,
    });
    return;
  }
  const stringStartDate = (interaction.options.get("start-date")?.value ||
    0) as string;
  const stringEndDate = interaction.options.get("end-date")?.value as string;
  const duckImage = interaction.options.get("image")?.attachment;
  const scheduledVoteId = interaction.options.get("scheduled-vote-id")
    ?.value as string;
  const ducks = interaction.options.get("ducks")?.value as string;
  const channel = interaction.options.get("channel")?.channel;
  const channelId = channel ? channel.id : interaction.channelId;

  const startDate = stringStartDate ? Date.parse(stringStartDate) : new Date();
  const endDate = new Date(Date.parse(stringEndDate));

  if (!duckImage) {
    await interaction.reply({
      content: "Duck image not found",
      ephemeral: true,
    });
    return;
  }

  const connection = await createConnection(getDbOptions());

  if (!scheduledVoteId) {
    await connection.execute(
      `INSERT INTO scheduled_votes (ducks, start_date, end_date, image, channelId) VALUES (?, ?, ?, ?, ?)`,
      [ducks, startDate, endDate, duckImage.url, channelId]
    );
  } else
    await connection.execute(
      `UPDATE scheduled_votes SET ducks = ?, start_date = ?, end_date = ?, image = ?, channelId = ? WHERE id = ?`,
      [ducks, startDate, endDate, duckImage.url, channelId, scheduledVoteId]
    );

  connection.end();

  if (scheduledVoteId) refreshMessage(interaction.client, scheduledVoteId);

  await interaction.reply({
    content: !scheduledVoteId ? `Vote added` : `Vote edited`,
    ephemeral: true,
  });
};

module.exports = {
  name: "add-new-vote",
  description: "Creates a new bote",
  execute: addScheduledVote,
  options: [
    {
      name: "end-date",
      description: "Duration in hours (floats allowed)",
      type: 3,
      required: true,
    },
    {
      name: "ducks",
      description: "duck_name:Vote Title,duck_name2:Vote Title 2",
      type: 3,
      required: true,
    },
    {
      name: "image",
      description: "The vote illustration",
      type: 11,
      required: true,
    },
    {
      name: "channel",
      description:
        "The channel to send the vote to (optional, default current channel)",
      type: 7,
      required: false,
    },
    {
      name: "start-date",
      description: "Start in x hours (floats allowed) (optional)",
      type: 3,
      required: false,
    },
    {
      name: "vote-id",
      description: "The id of the vote to edit (optional)",
      type: 3,
      required: false,
    },
  ],
};
