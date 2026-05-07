import { CSSProperties, useState } from "react";
import { observer } from "mobx-react-lite";
import { PlayerInstance, ScoreSheetInstance } from "../models/scoreStore";
import { useStore } from "../storeContext";
import { ScoreDialog } from "./ScoreDialog";
import styles from "./ScoreSheet.module.css";

const scoreFontSize = (score: number) => {
  const digits = String(score).length;
  const rem = Math.max(0.35, Math.min(2.45, 5.2 / digits));
  return `${rem.toFixed(2)}rem`;
};

const PlayerRow = observer(
  ({
    player,
    sheet,
  }: {
    player: PlayerInstance;
    sheet: ScoreSheetInstance;
  }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
      <article
        className={styles.playerCard}
        style={{ "--player-color": player.color } as CSSProperties}
      >
        <div className={styles.playerIdentity}>
          <div className={styles.avatar}>{player.initials}</div>
          <div className={styles.playerName}>{player.name}</div>
        </div>

        <button
          className={`${styles.scoreDeltaButton} ${styles.minusButton}`}
          type="button"
          onClick={() => sheet.addScore(player.id, -1)}
          aria-label={`Subtract 1 from ${player.name}`}
        >
          −1
        </button>

        <button
          className={styles.scoreButton}
          style={{ fontSize: scoreFontSize(player.score) }}
          type="button"
          onClick={() => setIsDialogOpen(true)}
          aria-label={`Open score controls for ${player.name}`}
        >
          {player.score}
        </button>

        <button
          className={`${styles.scoreDeltaButton} ${styles.plusButton}`}
          type="button"
          onClick={() => sheet.addScore(player.id, 1)}
          aria-label={`Add 1 to ${player.name}`}
        >
          +1
        </button>

        {isDialogOpen ? (
          <ScoreDialog
            player={player}
            sheet={sheet}
            onClose={() => setIsDialogOpen(false)}
          />
        ) : null}
      </article>
    );
  },
);

export const ScoreSheet = observer(
  ({ sheet }: { sheet: ScoreSheetInstance }) => {
    const store = useStore();
    const sortLabel =
      sheet.sortDirection === "desc" ? "High first" : "Low first";

    return (
      <section className={styles.screen}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Score sheet</p>
            <h1>Scores</h1>
          </div>
          <button
            className={styles.newButton}
            type="button"
            onClick={() => store.showNewSheet()}
          >
            New
          </button>
        </header>

        <div className={styles.toolbar}>
          <span>{sheet.players.length} players</span>
          <div className={styles.sortControls}>
            <button
              className={styles.sortButton}
              type="button"
              onClick={() => sheet.toggleSortDirection()}
            >
              {sortLabel}
            </button>
            <button
              className={styles.sortButton}
              type="button"
              onClick={() => sheet.sortPlayersByScore()}
            >
              Sort
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
  },
);
