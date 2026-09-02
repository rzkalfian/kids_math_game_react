const DOTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({ value, rolling, onClick, disabled, label }) {
  return (
    <button
      className={`dice ${rolling ? 'dice--rolling' : ''}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {value > 0 ? (
        <span className="dice__grid" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} className={DOTS[value].includes(index) ? 'dot' : ''} />
          ))}
        </span>
      ) : (
        <span className="dice__hint" aria-hidden="true">?</span>
      )}
    </button>
  );
}
