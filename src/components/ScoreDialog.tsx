import { CSSProperties, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { currentLang, t } from '../i18n';
import { PlayerInstance, ScoreSheetInstance } from '../models/scoreStore';
import styles from './ScoreDialog.module.css';

const formatEntryTime = (createdAt: number) =>
  new Intl.DateTimeFormat(currentLang, {
    hour: '2-digit',
    minute: '2-digit',
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
    const [value, setValue] = useState('');
    const dialogRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recentEntries = [...player.entries].reverse().slice(0, 8);

    const focusValueInput = useCallback(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
        window.setTimeout(() => {
          inputRef.current?.scrollIntoView({ block: 'center', inline: 'nearest' });
        }, 250);
      });
    }, []);

    useEffect(() => {
      const updateViewport = () => {
        const visualViewport = window.visualViewport;
        const viewportHeight = visualViewport?.height ?? window.innerHeight;
        const viewportTop = visualViewport?.offsetTop ?? 0;
        const keyboardHeight = Math.max(0, window.innerHeight - viewportHeight - viewportTop);

        document.documentElement.style.setProperty('--score-dialog-viewport-height', `${viewportHeight}px`);
        document.documentElement.style.setProperty('--score-dialog-viewport-top', `${viewportTop}px`);
        document.documentElement.style.setProperty(
          '--score-dialog-top-padding',
          keyboardHeight > 80 ? '0.75rem' : '3.5rem',
        );
      };

      document.body.classList.add('dialogOpen');
      updateViewport();
      window.visualViewport?.addEventListener('resize', updateViewport);
      window.visualViewport?.addEventListener('scroll', updateViewport);
      window.addEventListener('resize', updateViewport);
      focusValueInput();

      return () => {
        document.body.classList.remove('dialogOpen');
        window.visualViewport?.removeEventListener('resize', updateViewport);
        window.visualViewport?.removeEventListener('scroll', updateViewport);
        window.removeEventListener('resize', updateViewport);
        document.documentElement.style.removeProperty('--score-dialog-viewport-height');
        document.documentElement.style.removeProperty('--score-dialog-viewport-top');
        document.documentElement.style.removeProperty('--score-dialog-top-padding');
      };
    }, [focusValueInput]);

    const parsedValue = () => {
      const numberValue = Math.abs(Number(value));
      return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
    };

    const finishChange = () => {
      if (sheet.keepScoreDialogOpen) {
        setValue('');
        focusValueInput();
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
          ref={dialogRef}
          onClick={(event) => event.stopPropagation()}
        >
          <header className={styles.header} style={{ '--player-color': player.color } as CSSProperties}>
            <div className={styles.avatar}>{player.initials}</div>
            <div>
              <p className={styles.eyebrow}>{t('adjustScore')}</p>
              <h2 id="score-dialog-title">{player.name}</h2>
            </div>
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
              aria-label={t('closeScoreDialog')}
            >
              ×
            </button>
          </header>

          <div className={styles.currentScore} style={{ fontSize: scoreFontSize(player.score) }}>
            {player.score}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.valueLabel}>
              {t('value')}
              <input
                ref={inputRef}
                inputMode="numeric"
                min="1"
                step="1"
                type="number"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                aria-label={t('scoreValue')}
              />
            </label>

            <label className={styles.keepOpenToggle}>
              <input
                type="checkbox"
                checked={sheet.keepScoreDialogOpen}
                onChange={(event) => sheet.setKeepScoreDialogOpen(event.target.checked)}
              />
              <span>{t('keepMenuOpen')}</span>
            </label>

            <div className={styles.formActions}>
              <button className={styles.deleteButton} type="button" onClick={() => submitValue(-1)}>
                {t('delete')}
              </button>
              <button className={styles.addButton} type="submit">
                {t('add')}
              </button>
            </div>
          </form>

          <div className={styles.quickGrid}>
            {[1, 5, 10].map((amount) => (
              <button key={amount} type="button" onClick={() => addValue(amount)}>
                +{amount}
              </button>
            ))}
            {[-1, -5, -10].map((amount) => (
              <button key={amount} type="button" onClick={() => addValue(amount)}>
                {amount}
              </button>
            ))}
          </div>

          <section className={styles.history}>
            <h3>{t('recentChanges')}</h3>
            {recentEntries.length === 0 ? (
              <p className={styles.emptyHistory}>{t('noScoreChanges')}</p>
            ) : (
              <ul>
                {recentEntries.map((entry) => (
                  <li key={entry.id}>
                    <span className={entry.value > 0 ? styles.positiveEntry : styles.negativeEntry}>
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
                      {t('undo')}
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
