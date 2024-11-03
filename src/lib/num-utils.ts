export const clampedRnd = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const randInt = (min: number, max: number) => {
  return (Math.random() * (max - min + 1) + min) | 0;
};
