const ROLL_DELAY_MS = 450;

export function createRandomNumberRepository(random = Math.random) {
  return {
    async getRandomNumber(minimum = 1, maximum = 6) {
      await new Promise((resolve) => setTimeout(resolve, ROLL_DELAY_MS));
      return Math.floor(random() * (maximum - minimum + 1)) + minimum;
    },
  };
}
