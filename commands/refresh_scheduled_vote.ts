import { CommandInteraction } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";
import refreshMessage from "../utils/refreshMessage";

const deleteScheduledVote = async (interaction: CommandInteraction) => {
  if (typeof interaction.member?.permissions === "string") return;
  if (!interaction.member?.permissions.has("Administrator")) {
    await interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true,
    });
    return;
  }
  const voteMessageUrl = interaction.options.get("vote-message-url")
    ?.value as string;

  const connection = await createConnection(getDbOptions());

  const parts = voteMessageUrl.split("/");
  const channelId = parts[parts.length - 2];
  const messageId = parts[parts.length - 1];

  const [scheduledVotes] = await connection.execute(
    `SELECT * FROM scheduled_votes WHERE channelId = ? AND messageId = ?`,
    [channelId, messageId]
  );
  if (!Array.isArray(scheduledVotes)) {
    await interaction.reply({
      content: "Error getting scheduled_votes",
      ephemeral: true,
    });
    connection.end();
    return;
  }
  if (!scheduledVotes.length) {
    await interaction.reply({
      content: "Vote not found",
      ephemeral: true,
    });
    connection.end();
    return;
  }

  const scheduledVote = scheduledVotes[0] as any;

  const voteId = scheduledVote.id;

  await refreshMessage(interaction.client, voteId);

  await interaction.reply({
    content: "Vote updated",
    ephemeral: true,
  });
};

module.exports = {
  name: "refresh-scheduled-vote",
  description: "Refresh the selected scheduled vote.",
  options: [
    {
      name: "vote-message-url",
      description: "The message link of the vote to refresh.",
      type: 3,
      required: true,
    },
  ],
  execute: deleteScheduledVote,
};
