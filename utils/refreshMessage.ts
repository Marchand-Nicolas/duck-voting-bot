import { Client, TextChannel } from "discord.js";
import getDbOptions from "./getDbOptions";
import { createConnection } from "mysql2/promise";
import generateMessageBody, {
  generateEndMessageBody,
} from "./generateMessageBody";
import generateDuckComponents from "./generateDuckComponents";
import getDucks from "./getDucks";
import renderDuckTitle from "./renderDuckTitle";

const refreshMessage = async (client: Client, voteId: number | string) => {
  const db = await createConnection(getDbOptions());
  const [rows] = await db.execute(
    "SELECT * FROM scheduled_votes WHERE id = ?",
    [voteId]
  );
  if (!Array.isArray(rows)) return db.end();
  const scheduledVote = (rows as any[])[0];
  if (!scheduledVote) return db.end();
  const [rows2] = await db.execute(
    "SELECT * FROM votes WHERE scheduled_vote_id = ?",
    [voteId]
  );
  if (!Array.isArray(rows2)) return db.end();
  const votes = rows2 as any[];
  const ended = scheduledVote.ended;
  const messageId = scheduledVote.messageId;
  const channelId = scheduledVote.channelId;
  const channel = (await client.channels.fetch(channelId)) as TextChannel;
  if (!channel) return db.end();
  let newMessageContent = "";
  const endDate = scheduledVote.end_date;
  if (ended) {
    const { messageBody, winner, equality, totalVotes } =
      await generateEndMessageBody(client, scheduledVote, votes);
    newMessageContent =
      `**${winner.title} HAS BEEN CHOSEN ! 🎉**\n`.toUpperCase();
    newMessageContent +=
      "<:line:1227636115679346688><:line:1227636115679346688><:line:1227636115679346688>\n";
    if (equality)
      newMessageContent += `It's a draw ! Let's include OutSmth's personal vote, making ${renderDuckTitle(
        winner.title
      )} winner of the vote !\n\n`;
    newMessageContent += messageBody;
    newMessageContent += `\n\nTotal votes: ${totalVotes}`;
  } else {
    newMessageContent = `**LET'S VOTE FOR THE NEXT DUCK !**
\`(vote will end \`<t:${Math.floor(endDate.getTime() / 1000)}:R>)`;
    const { messageBody, totalVotes } = await generateMessageBody(
      client,
      scheduledVote,
      votes
    );
    newMessageContent += messageBody;
    newMessageContent += `\n\nTotal votes: \`${totalVotes}\``;
  }
  const duckImage = scheduledVote.image as string;
  const message = messageId ? await channel.messages.fetch(messageId) : null;

  const components = ended
    ? []
    : ((await generateDuckComponents(
        client,
        getDucks(scheduledVote.ducks),
        voteId
      )) as any);

  if (message) db.end();
  if (message)
    message.edit({
      content: newMessageContent,
      files: [duckImage],
      components: components,
    });
  else
    channel
      .send({
        content: newMessageContent,
        files: [duckImage],
        components: components,
      })
      .then((message) => {
        db.execute("UPDATE scheduled_votes SET messageId = ? WHERE id = ?", [
          message.id,
          voteId,
        ]);
        db.end();
      });
};

export default refreshMessage;
