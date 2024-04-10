import { ButtonInteraction } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";
import refreshMessage from "../utils/refreshMessage";
import generateMessageBody from "../utils/generateMessageBody";
import getDucks from "../utils/getDucks";
import renderDuckTitle from "../utils/renderDuckTitle";

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
  const ducks = getDucks(scheduledVote.ducks);
  const duck = ducks.find((duck) => duck.name === duckName);
  if (!duck) {
    await db.end();
    return interaction.reply({
      content: "Invalid duck",
      ephemeral: true,
    });
  }
  const ended = scheduledVote.ended;
  if (ended) {
    const [rows2] = await db.execute(
      "SELECT * FROM votes WHERE scheduled_vote_id = ?",
      [scheduledVoteId]
    );
    if (!Array.isArray(rows2)) return db.end();
    const votes = rows2 as any[];
    await db.end();
    const { winner } = await generateMessageBody(
      interaction.client,
      scheduledVote,
      votes
    );
    return interaction.reply({
      content: `Vote is over, ${renderDuckTitle(
        winner.title
      )} has already been selected by the community`,
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
      content: `<:votered:1226889515281678356> *Your vote for **${renderDuckTitle(
        duck.title
      ).toLowerCase()}** has been revoked*`,
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
    content: `<:votegreen:1226889512723025922> *Your vote for **${renderDuckTitle(
      duck.title
    ).toLowerCase()}** has been added*`,
    ephemeral: true,
  });
};

module.exports = vote;
