import test from "node:test";
import assert from "node:assert/strict";
import {
  GAME_STATUS,
  OPERATIONS,
  answerQuestion,
  calculateAnswer,
  changeOperation,
  createInitialGameState,
  nextQuestion,
  revealFirst,
  revealSecond,
} from "./game.js";

test("runs a complete correct addition round", () => {
  let state = createInitialGameState();
  state = revealFirst(state, 4);
  assert.equal(state.status, GAME_STATUS.FIRST_REVEALED);
  state = revealSecond(state, 3);
  assert.equal(state.status, GAME_STATUS.READY);
  state = answerQuestion(state, 7);

  assert.equal(state.status, GAME_STATUS.ANSWERED);
  assert.equal(state.score, 1);
  assert.equal(state.totalQuestions, 1);
  assert.deepEqual(state.answers, [true]);

  state = nextQuestion(state);
  assert.equal(state.status, GAME_STATUS.INITIAL);
  assert.equal(state.score, 1);
});

test("supports subtraction without negative results", () => {
  let state = changeOperation(createInitialGameState(), OPERATIONS.SUBTRACT);
  state = revealSecond(revealFirst(state, 2), 6);

  // Automatically ensures firstNumber >= secondNumber so result is non-negative
  assert.equal(state.firstNumber, 6);
  assert.equal(state.secondNumber, 2);
  assert.equal(calculateAnswer(state.firstNumber, state.secondNumber, OPERATIONS.SUBTRACT), 4);

  state = answerQuestion(state, 4);
  assert.equal(state.score, 1);
  assert.equal(state.totalQuestions, 1);
  assert.deepEqual(state.answers, [true]);
});

test("swaps numbers when changing operation to subtraction if needed", () => {
  let state = createInitialGameState();
  state = revealSecond(revealFirst(state, 2), 7);
  assert.equal(state.firstNumber, 2);
  assert.equal(state.secondNumber, 7);

  state = changeOperation(state, OPERATIONS.SUBTRACT);
  assert.equal(state.firstNumber, 7);
  assert.equal(state.secondNumber, 2);
  assert.equal(calculateAnswer(state.firstNumber, state.secondNumber, OPERATIONS.SUBTRACT), 5);
});

test("calculateAnswer never returns negative numbers", () => {
  assert.equal(calculateAnswer(2, 6, OPERATIONS.SUBTRACT), 0);
  assert.equal(calculateAnswer(6, 2, OPERATIONS.SUBTRACT), 4);
  assert.equal(calculateAnswer(5, 5, OPERATIONS.SUBTRACT), 0);
});

test("ignores transitions in the wrong order", () => {
  const initial = createInitialGameState();
  assert.strictEqual(revealSecond(initial, 4), initial);
  assert.strictEqual(answerQuestion(initial, 4), initial);
});
