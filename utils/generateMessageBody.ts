import capitalize from "./capitalize";
import { Client } from "discord.js";
import { ScheduledVote, Vote } from "types/vote";
import getEmojiPairByDuckName from "./getEmojiPairByDuckName";
import generateEmojiBar from "./generateEmojiBar";
import getDucks from "./getDucks";
import convertDuckNameToId from "./convertDuckNameToId";

const generateMessageBody = async (
  client: Client,
  scheduledVote: ScheduledVote,
  votes: Vote[]
) => {
  const ducks = getDucks(scheduledVote.ducks);
  let messageBody = "";
  const total = getVoteAmount(votes, votes);
  const winner = {
    name: "",
    votes: -1,
  };
  for (let index = 0; index < ducks.length; index++) {
    const duck = ducks[index];
    const duckName = capitalize(duck.title);
    const duckVotes = getDuckVotes(votes, convertDuckNameToId(duckName));
    const voteAmount = getVoteAmount(duckVotes, votes);
    if (voteAmount > winner.votes) {
      winner.name = duckName;
      winner.votes = voteAmount;
    }
    const part = voteAmount / (total || 1);
    const emojiPair = await getEmojiPairByDuckName(
      client,
      convertDuckNameToId(duckName)
    );
    const bar = generateEmojiBar(emojiPair.body, emojiPair.head, part);
    messageBody += newLine(capitalize(duck.title));
    messageBody += newLine(`${bar} \`${Math.round(part * 100)}%\``);
    messageBody += index < ducks.length - 1 ? newLine(" ") : "\n";
  }
  return {
    messageBody,
    winner,
  };
};

export default generateMessageBody;

const newLine = (line: string) => {
  return "\n > " + line;
};

const getDuckVotes = (votes: Vote[], duckName: string) => {
  return votes.filter((vote) => vote.duck_name === duckName);
};

const getVoteAmount = (duckVotes: Vote[], votes: Vote[]) => {
  // If a user has voted for multiple ducks, we need to divide the total votes by the amount of ducks they voted for
  // We return the amount of votes for a specific duck
  let total = 0;
  duckVotes.forEach((vote) => {
    const userVotes = votes.filter((v) => v.user_id === vote.user_id);
    total += 1 / userVotes.length;
  });
  return total;
};
