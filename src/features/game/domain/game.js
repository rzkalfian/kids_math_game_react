export const OPERATIONS = Object.freeze({ ADD: "+", SUBTRACT: "-" });

export const GAME_STATUS = Object.freeze({
  INITIAL: "initial",
  FIRST_REVEALED: "first_revealed",
  READY: "ready",
  ANSWERED: "answered",
});

export function createInitialGameState(operation = OPERATIONS.ADD) {
  return {
    firstNumber: 0,
    secondNumber: 0,
    operation,
    status: GAME_STATUS.INITIAL,
    score: 0,
    totalQuestions: 0,
    answers: [],
    userAnswer: null,
  };
}

export function calculateAnswer(firstNumber, secondNumber, operation) {
  return operation === OPERATIONS.ADD
    ? firstNumber + secondNumber
    : firstNumber - secondNumber;
}

export function revealFirst(state, value) {
  if (state.status !== GAME_STATUS.INITIAL) return state;
  return { ...state, firstNumber: value, status: GAME_STATUS.FIRST_REVEALED };
}

export function revealSecond(state, value) {
  if (state.status !== GAME_STATUS.FIRST_REVEALED) return state;
  return { ...state, secondNumber: value, status: GAME_STATUS.READY };
}

export function answerQuestion(state, userAnswer) {
  if (state.status !== GAME_STATUS.READY) return state;
  const isCorrect =
    userAnswer ===
    calculateAnswer(state.firstNumber, state.secondNumber, state.operation);

  return {
    ...state,
    userAnswer,
    status: GAME_STATUS.ANSWERED,
    score: state.score + (isCorrect ? 1 : 0),
    totalQuestions: state.totalQuestions + 1,
    answers: [...state.answers, isCorrect],
  };
}

export function nextQuestion(state) {
  return {
    ...state,
    firstNumber: 0,
    secondNumber: 0,
    userAnswer: null,
    status: GAME_STATUS.INITIAL,
  };
}

export function changeOperation(state, operation) {
  if (!Object.values(OPERATIONS).includes(operation)) return state;
  return { ...state, operation };
}
