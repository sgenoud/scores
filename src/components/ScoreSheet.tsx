import { CSSProperties, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { plural, t } from '../i18n';
import { PlayerInstance, ScoreSheetInstance } from '../models/scoreStore';
import { useStore } from '../storeContext';
import { ScoreDialog } from './ScoreDialog';
import styles from './ScoreSheet.module.css';

const scoreFontSize = (score: number) => {
  const digits = String(score).length;
  const rem = Math.max(0.35, Math.min(2.45, 5.2 / digits));
  return `${rem.toFixed(2)}rem`;
};

const PlayerRow = observer(({ player, sheet }: { player: PlayerInstance; sheet: ScoreSheetInstance }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <article className={styles.playerCard} style={{ '--player-color': player.color } as CSSProperties}>
      <div className={styles.playerIdentity}>
        <div className={styles.avatar}>{player.initials}</div>
        <div className={styles.playerName}>{player.name}</div>
      </div>

      <button
        className={`${styles.scoreDeltaButton} ${styles.minusButton}`}
        type="button"
        onClick={() => sheet.addScore(player.id, -1)}
        aria-label={t('subtractOne', { name: player.name })}
      >
        −1
      </button>

      <button
        className={styles.scoreButton}
        style={{ fontSize: scoreFontSize(player.score) }}
        type="button"
        onClick={() => setIsDialogOpen(true)}
        aria-label={t('openScoreControls', { name: player.name })}
      >
        {player.score}
      </button>

      <button
        className={`${styles.scoreDeltaButton} ${styles.plusButton}`}
        type="button"
        onClick={() => sheet.addScore(player.id, 1)}
        aria-label={t('addOne', { name: player.name })}
      >
        +1
      </button>

      {isDialogOpen ? (
        <ScoreDialog player={player} sheet={sheet} onClose={() => setIsDialogOpen(false)} />
      ) : null}
    </article>
  );
});

export const ScoreSheet = observer(({ sheet }: { sheet: ScoreSheetInstance }) => {
  const store = useStore();
  const sortLabel = sheet.sortDirection === 'desc' ? t('highFirst') : t('lowFirst');

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t('scoreSheet')}</p>
          <h1>{t('scores')}</h1>
        </div>
        <button className={styles.newButton} type="button" onClick={() => store.showNewSheet()}>
          {t('new')}
        </button>
      </header>

      <div className={styles.toolbar}>
        <span>{plural(sheet.players.length, 'playersCount', 'playersCountPlural')}</span>
        <div className={styles.sortControls}>
          <button
            className={`${styles.sortButton} ${styles.sortIconButton}`}
            type="button"
            onClick={() => sheet.toggleSortDirection()}
            aria-label={sortLabel}
            title={sortLabel}
          >
            {sheet.sortDirection === 'desc' ? '▼' : '▲'}
          </button>
          <button className={styles.sortButton} type="button" onClick={() => sheet.sortPlayersByScore()}>
            {t('sort')}
          </button>
        </div>
      </div>

      <div className={styles.playerList}>
        {sheet.players.map((player) => (
          <PlayerRow key={player.id} player={player} sheet={sheet} />
        ))}
      </div>
    </section>
  );
});
