import { CommandInteraction, TextChannel } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";

const deleteScheduledVote = async (interaction: CommandInteraction) => {
  if (typeof interaction.member?.permissions === "string") return;
  if (!interaction.member?.permissions.has("Administrator")) {
    await interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true,
    });
    return;
  }
  const scheduledVoteId = interaction.options.get("vote-id")?.value as string;

  const connection = await createConnection(getDbOptions());

  // Delete messages
  const [scheduledVotes] = await connection.execute(
    `SELECT channelId, messageId FROM scheduled_votes WHERE id = ?`,
    [scheduledVoteId]
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
      content: "vOTE not found",
      ephemeral: true,
    });
    connection.end();
    return;
  }

  const scheduledVote = scheduledVotes[0] as any;

  const channelId = scheduledVote.channelId;
  if (channelId) {
    const messageId = scheduledVote.messageId;
    const channel = (await interaction.guild?.channels.fetch(
      channelId
    )) as TextChannel;
    await channel.messages.delete(messageId).catch((e) => console.log(e));
  }

  await connection.execute(`DELETE FROM scheduled_votes WHERE id = ?`, [
    scheduledVoteId,
  ]);
  connection.end();

  await interaction.reply({
    content: "Vote deleted",
    ephemeral: true,
  });
};

module.exports = {
  name: "delete-scheduled-vote",
  description: "Deleted the selected scheduled vote.",
  options: [
    {
      name: "vote-id",
      description:
        "The id of the vote to delete. Use /list-votes to get the id.",
      type: 4,
      required: true,
    },
  ],
  execute: deleteScheduledVote,
};
