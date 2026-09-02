import { useRef, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, RefreshCw, Star, Trash2, X } from 'lucide-react';
import { calculateAnswer, GAME_STATUS, OPERATIONS } from '../../domain/game.js';
import { useGame } from '../../application/useGame.js';
import { Dice } from './Dice.jsx';
import { NumberPad } from './NumberPad.jsx';

function PlayingPiece({ mode, value, slot, rolling, onClick, disabled }) {
  if (mode === 'dice') {
    return <Dice value={value} rolling={rolling} onClick={onClick} disabled={disabled} label={`Kocok dadu ${slot}`} />;
  }

  if (mode === 'cards') {
    return (
      <button className={`number-card ${rolling ? 'number-card--flipping' : ''}`} type="button" onClick={onClick} disabled={disabled}>
        <span>{value || '?'}</span><small>{value ? 'KARTU ANGKA' : `BUKA ${slot.toUpperCase()}`}</small>
      </button>
    );
  }

  return (
    <button className={`nest ${rolling ? 'nest--rolling' : ''}`} type="button" onClick={onClick} disabled={disabled}>
      <span className="nest__chicks" aria-hidden="true">{value ? '🐥'.repeat(value) : '?'}</span>
      <small>{value ? `${value} anak ayam` : `Buka ${slot}`}</small>
    </button>
  );
}

function FarmerDragAnswer({ value, onChange, onSubmit }) {
  const chickCount = Math.abs(value);
  const canAdd = chickCount < 12;
  const coopRef = useRef(null);
  const [dragPosition, setDragPosition] = useState(null);

  function changeChickCount(nextCount) {
    onChange(value < 0 ? -nextCount : nextCount);
  }

  function finishDrag(event) {
    const coopBounds = coopRef.current?.getBoundingClientRect();
    const isOverCoop = coopBounds
      && event.clientX >= coopBounds.left
      && event.clientX <= coopBounds.right
      && event.clientY >= coopBounds.top
      && event.clientY <= coopBounds.bottom;

    setDragPosition(null);
    if (isOverCoop && canAdd) changeChickCount(chickCount + 1);
  }

  return (
    <div className="farmer-answer">
      <div className="chick-source">
        <span>Seret anak ayam</span>
        <button
          type="button"
          className="draggable-chick"
          disabled={!canAdd}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragPosition({ x: event.clientX, y: event.clientY });
          }}
          onPointerMove={(event) => dragPosition && setDragPosition({ x: event.clientX, y: event.clientY })}
          onPointerUp={finishDrag}
          onPointerCancel={() => setDragPosition(null)}
          onKeyDown={(event) => {
            if (canAdd && (event.key === 'Enter' || event.key === ' ')) changeChickCount(chickCount + 1);
          }}
          aria-label="Seret anak ayam ke kandang"
        >
          🐥
        </button>
        <small>{12 - chickCount} tersedia</small>
      </div>

      <div
        ref={coopRef}
        className="chick-coop"
        aria-label={`Jawaban ${value}, kandang berisi ${chickCount} anak ayam`}
      >
        <span className="chick-coop__label">Kandang jawaban</span>
        <div className="chick-coop__chicks" aria-hidden="true">
          {Array.from({ length: chickCount }, (_, index) => <span key={index}>🐥</span>)}
        </div>
        <output>{value}</output>
      </div>

      {dragPosition && (
        <span
          className="dragging-chick"
          style={{ left: dragPosition.x, top: dragPosition.y }}
          aria-hidden="true"
        >
          🐥
        </span>
      )}

      <div className="farmer-answer__actions">
        <button type="button" disabled={chickCount === 0} onClick={() => changeChickCount(chickCount - 1)} title="Hapus satu anak ayam" aria-label="Hapus satu anak ayam"><Trash2 /></button>
        <button type="button" disabled={chickCount === 0} onClick={() => onChange(-value)} title="Ubah tanda jawaban" aria-label="Ubah tanda jawaban">{value < 0 ? <Plus /> : <Minus />}</button>
        <button className="primary-button" type="button" onClick={onSubmit}><Check /> Periksa</button>
      </div>
    </div>
  );
}

export function GameBoard({ mode, randomNumberRepository, onBack }) {
  const { state, rollingSlot, roll, submitAnswer, changeOperation, restart } = useGame(randomNumberRepository);
  const [input, setInput] = useState('');
  const [farmerAnswer, setFarmerAnswer] = useState(0);
  const answer = calculateAnswer(state.firstNumber, state.secondNumber, state.operation);
  const isAnswered = state.status === GAME_STATUS.ANSWERED;
  const isCorrect = state.userAnswer === answer;

  function submit(value) {
    submitAnswer(value);
    setInput('');
    setFarmerAnswer(0);
  }

  return (
    <main className={`game-screen game-screen--${mode}`}>
      <header className="game-header">
        <button className="icon-button" type="button" onClick={onBack} title="Kembali"><ArrowLeft /></button>
        <div className="score"><Star fill="currentColor" /><span><strong>{state.score}</strong> dari {state.totalQuestions}</span></div>
        <div className="operation-switch" aria-label="Pilih operasi matematika">
          <button className={state.operation === OPERATIONS.ADD ? 'active' : ''} type="button" onClick={() => changeOperation(OPERATIONS.ADD)}><Plus /> Tambah</button>
          <button className={state.operation === OPERATIONS.SUBTRACT ? 'active' : ''} type="button" onClick={() => changeOperation(OPERATIONS.SUBTRACT)}><Minus /> Kurang</button>
        </div>
        <button className="icon-button" type="button" onClick={restart} title="Mulai ulang"><RefreshCw /></button>
      </header>

      <section className="game-stage">
        {isAnswered ? (
          <div className={`result ${isCorrect ? 'result--correct' : 'result--wrong'}`} role="status">
            <span className="result__icon">{isCorrect ? <Check /> : <X />}</span>
            <h2>{isCorrect ? 'Hebat, benar!' : 'Hampir benar!'}</h2>
            <p>{state.firstNumber} {state.operation} {state.secondNumber} = <strong>{answer}</strong></p>
          </div>
        ) : (
          <>
            <div className="problem" aria-label="Soal matematika">
              <PlayingPiece mode={mode} slot="pertama" value={state.firstNumber} rolling={rollingSlot === 'first'} onClick={() => roll('first')} disabled={state.status !== GAME_STATUS.INITIAL || Boolean(rollingSlot)} />
              <span className="operator">{state.operation}</span>
              <PlayingPiece mode={mode} slot="kedua" value={state.secondNumber} rolling={rollingSlot === 'second'} onClick={() => roll('second')} disabled={state.status !== GAME_STATUS.FIRST_REVEALED || Boolean(rollingSlot)} />
              <span className="operator">=</span>
              <span className="question-mark">?</span>
            </div>
            {state.status === GAME_STATUS.READY && (
              mode === 'farmer'
                ? <FarmerDragAnswer value={farmerAnswer} onChange={setFarmerAnswer} onSubmit={() => submit(farmerAnswer)} />
                : <NumberPad value={input} onChange={setInput} onSubmit={() => submit(Number(input))} />
            )}
          </>
        )}
      </section>

      <footer className="instruction" aria-live="polite">
        {state.status === GAME_STATUS.INITIAL && 'Tekan benda pertama untuk memulai'}
        {state.status === GAME_STATUS.FIRST_REVEALED && 'Bagus! Sekarang tekan benda kedua'}
        {state.status === GAME_STATUS.READY && (mode === 'farmer' ? 'Seret anak ayam ke kandang sesuai jawabanmu' : 'Hitung hasilnya, lalu masukkan jawabanmu')}
        {state.status === GAME_STATUS.ANSWERED && 'Soal berikutnya segera dimulai...'}
      </footer>
    </main>
  );
}
