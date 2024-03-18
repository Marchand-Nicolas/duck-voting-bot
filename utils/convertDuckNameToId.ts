const convertDuckNameToId = (emojiName: string) => {
  return emojiName.toLowerCase().split(" ").join("");
};

export default convertDuckNameToId;
