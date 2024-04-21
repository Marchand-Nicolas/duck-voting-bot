import capitalize from "./capitalize";
import { Client } from "discord.js";
import { ScheduledVote, Vote } from "types/vote";
import getEmojiPairByDuckName from "./getEmojiPairByDuckName";
import generateEmojiBar from "./generateEmojiBar";
import getDucks from "./getDucks";
import convertDuckNameToId from "./convertDuckNameToId";
import renderDuckTitle from "./renderDuckTitle";

const generateMessageBody = async (
  client: Client,
  scheduledVote: ScheduledVote,
  votes: Vote[]
) => {
  const ducks = getDucks(scheduledVote.ducks);
  let messageBody = "";
  const winner = {
    title: "",
    votes: -1,
  };
  for (let index = 0; index < ducks.length; index++) {
    const duck = ducks[index];
    const duckTitle = capitalize(duck.title);
    const duckVotes = getDuckVotes(votes, convertDuckNameToId(duck.name));
    if (duckVotes.length > winner.votes) {
      winner.title = duckTitle;
      winner.votes = duckVotes.length;
    }
    const part = duckVotes.length / (votes.length || 1);
    const emojiPair = await getEmojiPairByDuckName(
      client,
      convertDuckNameToId(duck.name)
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

export const generateEndMessageBody = async (
  client: Client,
  scheduledVote: ScheduledVote,
  votes: Vote[]
) => {
  const ducks = getDucks(scheduledVote.ducks);
  let messageBody = "";
  const winner = {
    title: "",
    votes: -1,
  };
  let equality = false;
  const messages = [];
  for (let index = 0; index < ducks.length; index++) {
    const duck = ducks[index];
    const duckTitle = capitalize(duck.title);
    const duckVotes = getDuckVotes(votes, convertDuckNameToId(duck.title));
    if (duckVotes.length > winner.votes) {
      winner.title = duckTitle;
      winner.votes = duckVotes.length;
      equality = false;
    } else if (duckVotes.length === winner.votes) {
      equality = true;
    }
    const part = duckVotes.length / (votes.length || 1);
    messages.push({
      voteAmount: duckVotes.length,
      message: renderDuckTitle(duckTitle) + ` \`(${Math.round(part * 100)}%)\``,
    });
  }
  messages.sort((a, b) => b.voteAmount - a.voteAmount);
  for (let index = 0; index < messages.length; index++) {
    const m = messages[index];
    if (index > 0) messageBody += "\n";
    if (index === 0)
      messageBody +=
        "<:votegreen:1226889512723025922> **NEXT MINT :** " + m.message;
    else if (index === 1)
      messageBody +=
        "<:voteorange:1226890359863382108> **REDEMPTION WEEK :** " + m.message;
    else
      messageBody +=
        "<:votered:1226889515281678356> **ELIMINATED :** " + m.message;
  }
  return {
    messageBody,
    winner,
    equality,
  };
};

export default generateMessageBody;

const newLine = (line: string) => {
  return "\n > " + line;
};

const getDuckVotes = (votes: Vote[], duckName: string) => {
  return votes.filter((vote) => vote.duck_name === duckName);
};
