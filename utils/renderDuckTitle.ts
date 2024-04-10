import capitalize from "./capitalize";

const renderDuckTitle = (duckTitle: string) => {
  const title = duckTitle.startsWith(" ") ? duckTitle.slice(1) : duckTitle;
  return capitalize(title);
};

export default renderDuckTitle;
