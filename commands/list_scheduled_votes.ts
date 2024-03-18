import { CommandInteraction } from "discord.js";
import getDbOptions from "../utils/getDbOptions";
import { createConnection } from "mysql2/promise";
import getDucks from "../utils/getDucks";

const listVotes = async (interaction: CommandInteraction) => {
  if (typeof interaction.member?.permissions === "string") return;
  if (!interaction.member?.permissions.has("Administrator")) {
    await interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true,
    });
    return;
  }
  const connection = await createConnection(getDbOptions());

  const [rows] = await connection.execute(
    `SELECT ducks, id FROM scheduled_votes ORDER BY id DESC LIMIT 10`
  );

  connection.end();

  interaction.reply({
    content: `**Showing 10 most recent scheduled votes**\n${(rows as any)
      .map(
        (row: any) =>
          `__${row.id}__: ${getDucks(row.ducks)
            .map((duck: any) => duck.title)
            .join(", ")}`
      )
      .join("\n")}`,
    ephemeral: true,
  });
};

module.exports = {
  name: "list-votes",
  description: "Lists all scheduled votes.",
  execute: listVotes,
};
