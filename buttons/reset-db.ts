import { ButtonInteraction, TextChannel } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";

const resetDb = async (interaction: ButtonInteraction) => {
  const db = await createConnection(getDbOptions());

  await db.execute("DELETE FROM scheduled_votes");
  await db.execute("DELETE FROM votes");

  db.end();

  await interaction.reply({
    content: "✅ Database reset",
    ephemeral: true,
  });
};

module.exports = resetDb;
