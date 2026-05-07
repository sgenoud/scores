import { CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { PlayerInstance, ScoreSheetInstance } from "../models/scoreStore";
import styles from "./ScoreDialog.module.css";

const formatEntryTime = (createdAt: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

const scoreFontSize = (score: number) => {
  const digits = String(score).length;
  const rem = Math.max(1.25, Math.min(7, 34 / digits));
  return `${rem.toFixed(2)}rem`;
};

export const ScoreDialog = observer(
  ({
    player,
    sheet,
    onClose,
  }: {
    player: PlayerInstance;
    sheet: ScoreSheetInstance;
    onClose: () => void;
  }) => {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const recentEntries = [...player.entries].reverse().slice(0, 8);

    useEffect(() => {
      document.body.classList.add("dialogOpen");
      inputRef.current?.focus();
      return () => document.body.classList.remove("dialogOpen");
    }, []);

    const parsedValue = () => {
      const numberValue = Math.abs(Number(value));
      return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
    };

    const finishChange = () => {
      if (sheet.keepScoreDialogOpen) {
        setValue("");
        inputRef.current?.focus();
      } else {
        onClose();
      }
    };

    const addValue = (amount: number) => {
      sheet.addScore(player.id, amount);
      finishChange();
    };

    const submitValue = (multiplier: 1 | -1) => {
      const amount = parsedValue();
      if (!amount) return;
      addValue(amount * multiplier);
    };

    const handleSubmit = (event: FormEvent) => {
      event.preventDefault();
      submitValue(1);
    };

    return (
      <div className={styles.backdrop} role="presentation" onClick={onClose}>
        <section
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="score-dialog-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header
            className={styles.header}
            style={{ "--player-color": player.color } as CSSProperties}
          >
            <div className={styles.avatar}>{player.initials}</div>
            <div>
              <p className={styles.eyebrow}>Adjust score</p>
              <h2 id="score-dialog-title">{player.name}</h2>
            </div>
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
              aria-label="Close score dialog"
            >
              ×
            </button>
          </header>

          <div
            className={styles.currentScore}
            style={{ fontSize: scoreFontSize(player.score) }}
          >
            {player.score}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.valueLabel}>
              Value
              <input
                ref={inputRef}
                inputMode="numeric"
                min="1"
                step="1"
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-label="Score value"
              />
            </label>

            <label className={styles.keepOpenToggle}>
              <input
                type="checkbox"
                checked={sheet.keepScoreDialogOpen}
                onChange={(event) =>
                  sheet.setKeepScoreDialogOpen(event.target.checked)
                }
              />
              <span>Keep menu open after change</span>
            </label>

            <div className={styles.formActions}>
              <button
                className={styles.deleteButton}
                type="button"
                onClick={() => submitValue(-1)}
              >
                Delete
              </button>
              <button className={styles.addButton} type="submit">
                Add
              </button>
            </div>
          </form>

          <div className={styles.quickGrid}>
            {[1, 5, 10].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => addValue(amount)}
              >
                +{amount}
              </button>
            ))}
            {[-1, -5, -10].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => addValue(amount)}
              >
                {amount}
              </button>
            ))}
          </div>

          <section className={styles.history}>
            <h3>Recent changes</h3>
            {recentEntries.length === 0 ? (
              <p className={styles.emptyHistory}>No score changes yet.</p>
            ) : (
              <ul>
                {recentEntries.map((entry) => (
                  <li key={entry.id}>
                    <span
                      className={
                        entry.value > 0
                          ? styles.positiveEntry
                          : styles.negativeEntry
                      }
                    >
                      {entry.value > 0 ? `+${entry.value}` : entry.value}
                    </span>
                    <time>{formatEntryTime(entry.createdAt)}</time>
                    <button
                      type="button"
                      onClick={() => {
                        sheet.removeScoreEntry(player.id, entry.id);
                        finishChange();
                      }}
                    >
                      Undo
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </div>
    );
  },
);
