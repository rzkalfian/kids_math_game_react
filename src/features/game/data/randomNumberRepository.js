import { TIMINGS } from "../constants.js";

export function createRandomNumberRepository(random = Math.random) {
  return {
    async getRandomNumber(minimum = 1, maximum = 6) {
      await new Promise((resolve) =>
        setTimeout(resolve, TIMINGS.ROLL_DELAY_MS),
      );
      return Math.floor(random() * (maximum - minimum + 1)) + minimum;
    },
  };
}
