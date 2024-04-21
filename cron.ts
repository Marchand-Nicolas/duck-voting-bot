import { Client, TextChannel } from "discord.js";
import getDbOptions from "./utils/getDbOptions";
import { createConnection } from "mysql2/promise";
import refreshMessage from "./utils/refreshMessage";

const startCron = (client: Client) => {
  refresh(client);
  setInterval(() => refresh(client), 1000);
};

const refresh = async (client: Client) => {
  const db = await createConnection(getDbOptions());

  const [rows] = await db.execute(
    "SELECT * FROM scheduled_votes WHERE ended = 0"
  );

  if (!Array.isArray(rows)) return db.end();

  for (let index = 0; index < rows.length; index++) {
    const scheduledVote = rows[index] as any;
    const id = scheduledVote.id;
    const started = scheduledVote.started;
    const ended = scheduledVote.ended;
    const endDate = new Date(scheduledVote.end_date);
    const now = new Date();
    const startDate = new Date(scheduledVote.start_date);
    const channelId = scheduledVote.channelId;
    const messageId = scheduledVote.messageId;
    if (!channelId) continue;
    const channel = (await client.channels.fetch(channelId)) as TextChannel;
    if (!channel) continue;
    if (!messageId) {
      // Check if scheduled vote has started
      if (
        started === 0 &&
        startDate.getTime() <= now.getTime() &&
        ended === 0
      ) {
        await db.execute(
          "UPDATE scheduled_votes SET started = 1 WHERE id = ?",
          [id]
        );
        await refreshMessage(client, id);
        continue;
      }
    } else {
      try {
        const message = await channel.messages.fetch(messageId);
        if (!message) continue;
        // Check if ended
        if (endDate.getTime() <= now.getTime() && ended === 0) {
          refreshMessage(client, id);
          await db.execute(
            "UPDATE scheduled_votes SET ended = 1 WHERE id = ?",
            [id]
          );
          continue;
        }
      } catch (e) {
        console.log(e);
        // Set as ended if message is not found
        await db.execute("UPDATE scheduled_votes SET ended = 1 WHERE id = ?", [
          id,
        ]);
      }
    }
  }
  db.end();
};

export default startCron;
