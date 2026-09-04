import { Check, Delete, Minus } from "lucide-react";

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function NumberPad({ value, onChange, onSubmit, disabled }) {
  function append(number) {
    const digits = value.replace("-", "");
    if (digits.length < 2) onChange(value + number);
  }

  function toggleSign() {
    if (!value) return onChange("-");
    onChange(value.startsWith("-") ? value.slice(1) : `-${value}`);
  }

  return (
    <div className="answer-panel">
      <output className="answer-display" aria-live="polite">
        {value || "?"}
      </output>
      <div className="number-pad">
        {NUMBERS.map((number) => (
          <button
            key={number}
            type="button"
            disabled={disabled}
            onClick={() => append(number)}
          >
            {number}
          </button>
        ))}
        <button
          className="key key--sign"
          type="button"
          disabled={disabled}
          onClick={toggleSign}
          title="Ubah tanda"
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          className="key key--delete"
          type="button"
          disabled={disabled}
          onClick={() => onChange(value.slice(0, -1))}
          title="Hapus"
        >
          <Delete aria-hidden="true" />
        </button>
        <button
          className="key key--submit"
          type="button"
          disabled={disabled || !value || value === "-"}
          onClick={onSubmit}
          title="Kirim jawaban"
        >
          <Check aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
