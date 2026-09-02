const ROLL_DELAY_MS = 450;

export function createRandomNumberRepository(random = Math.random) {
  return {
    async getRandomNumber() {
      await new Promise((resolve) => setTimeout(resolve, ROLL_DELAY_MS));
      return Math.floor(random() * 6) + 1;
    },
  };
}
