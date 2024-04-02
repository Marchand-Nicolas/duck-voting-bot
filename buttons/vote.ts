import { ButtonInteraction } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";
import refreshMessage from "../utils/refreshMessage";

const vote = async (interaction: ButtonInteraction) => {
  const interactionId = interaction.customId;
  const [_, duckName, scheduledVoteId] = interactionId.split(":");
  const db = await createConnection(getDbOptions());
  const [rows] = await db.execute(
    "SELECT * FROM scheduled_votes WHERE id = ?",
    [scheduledVoteId]
  );
  if (!Array.isArray(rows)) return db.end();
  const scheduledVote = (rows as any[])[0];
  if (!scheduledVote) return db.end();
  const ended = scheduledVote.ended;
  if (ended) {
    await db.end();
    return interaction.reply({
      content: "❌ Voting has ended for this duck.",
      ephemeral: true,
    });
  }
  const res = await db.execute(
    "DELETE FROM votes WHERE scheduled_vote_id = ? AND user_id = ? AND duck_name = ?",
    [scheduledVoteId, interaction.user.id, duckName]
  );
  if ((res[0] as any).affectedRows > 0) {
    await db.end();
    refreshMessage(interaction.client, scheduledVoteId);
    return interaction.reply({
      content: `❌ Removed vote for ${duckName}`,
      ephemeral: true,
    });
  }
  await db.execute(
    "INSERT INTO votes (scheduled_vote_id, user_id, duck_name) VALUES (?, ?, ?)",
    [scheduledVoteId, interaction.user.id, duckName]
  );
  await db.end();

  refreshMessage(interaction.client, scheduledVoteId);

  await interaction.reply({
    content: `✅ Voted for ${duckName}. You can vote for another duck if you want, or remove your vote by clicking the button again.`,
    ephemeral: true,
  });
};

module.exports = vote;
