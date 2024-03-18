const generateEmojiBar = (body: string, head: string, part: number) => {
  const amout = Math.min(13, Math.max(0, Math.floor((part * 100) / 5) - 1));
  let emojiBar = "";
  for (let index = 0; index < amout; index++) {
    emojiBar += body;
  }
  emojiBar += head;
  return emojiBar;
};

export default generateEmojiBar;
