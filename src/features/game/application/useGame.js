import { useEffect, useReducer, useRef, useState } from 'react';
import {
  GAME_STATUS,
  answerQuestion,
  changeOperation,
  createInitialGameState,
  nextQuestion,
  revealFirst,
  revealSecond,
} from '../domain/game.js';

function reducer(state, action) {
  switch (action.type) {
    case 'reveal-first':
      return revealFirst(state, action.value);
    case 'reveal-second':
      return revealSecond(state, action.value);
    case 'answer':
      return answerQuestion(state, action.value);
    case 'next':
      return nextQuestion(state);
    case 'operation':
      return changeOperation(state, action.value);
    case 'restart':
      return createInitialGameState(state.operation);
    default:
      return state;
  }
}

export function useGame(randomNumberRepository) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialGameState);
  const [rollingSlot, setRollingSlot] = useState(null);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function roll(slot, minimumRollingDuration = 0) {
    const expectedStatus = slot === 'first'
      ? GAME_STATUS.INITIAL
      : GAME_STATUS.FIRST_REVEALED;
    if (rollingSlot || state.status !== expectedStatus) return;

    setRollingSlot(slot);
    const startedAt = Date.now();
    const value = await randomNumberRepository.getRandomNumber();
    const remainingDuration = minimumRollingDuration - (Date.now() - startedAt);
    if (remainingDuration > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingDuration));
    }
    dispatch({ type: `reveal-${slot}`, value });
    setRollingSlot(null);
  }

  function submitAnswer(value) {
    if (!Number.isInteger(value) || state.status !== GAME_STATUS.READY) return;
    dispatch({ type: 'answer', value });
    resetTimer.current = setTimeout(() => dispatch({ type: 'next' }), 1600);
  }

  return {
    state,
    rollingSlot,
    roll,
    submitAnswer,
    changeOperation: (value) => dispatch({ type: 'operation', value }),
    restart: () => dispatch({ type: 'restart' }),
  };
}
