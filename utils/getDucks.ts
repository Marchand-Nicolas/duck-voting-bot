const getDucks = (ducks: string) => {
  return ducks
    .split(",")
    .filter((duck) => duck)
    .map((duck) => {
      return {
        name: duck.toLowerCase().split(" ").join(""),
        title: duck,
      };
    });
};

export default getDucks;
