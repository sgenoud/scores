import { CSSProperties, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { plural, t } from "../i18n";
import { PlayerInstance, ScoreSheetInstance } from "../models/scoreStore";
import { seedFromText } from "../seed";
import { useStore } from "../storeContext";
import { useWakeLock } from "../useWakeLock";
import { RoughAvatar } from "./RoughAvatar";
import { RoughBox } from "./RoughBox";
import { RoughSeparator } from "./RoughSeparator";
import { ScoreDialog } from "./ScoreDialog";
import styles from "./ScoreSheet.module.css";

const QUICK_SCORE_MERGE_MS = 900;

const scoreFontSize = (score: number) => {
  const digits = String(score).length;
  const rem = Math.max(0.35, Math.min(2.45, 5.2 / digits));
  return `${rem.toFixed(2)}rem`;
};

const seedFromId = seedFromText;

const PlayerRow = observer(
  ({
    player,
    sheet,
  }: {
    player: PlayerInstance;
    sheet: ScoreSheetInstance;
  }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingDelta, setPendingDelta] = useState(0);
    const pendingDeltaRef = useRef(0);
    const pendingTimerRef = useRef<number | null>(null);

    useEffect(
      () => () => {
        if (pendingTimerRef.current)
          window.clearTimeout(pendingTimerRef.current);
      },
      [],
    );

    const addQuickScore = (value: 1 | -1) => {
      sheet.addScore(player.id, value, QUICK_SCORE_MERGE_MS, "quick");
      pendingDeltaRef.current += value;
      setPendingDelta(pendingDeltaRef.current);

      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current);
      if (pendingDeltaRef.current === 0) return;

      pendingTimerRef.current = window.setTimeout(() => {
        pendingDeltaRef.current = 0;
        pendingTimerRef.current = null;
        setPendingDelta(0);
      }, QUICK_SCORE_MERGE_MS);
    };

    return (
      <article
        className={styles.playerCard}
        style={{ "--player-color": player.color } as CSSProperties}
      >
        <RoughSeparator seed={seedFromId(player.id)} />
        <div className={styles.playerIdentity}>
          <RoughAvatar
            initials={player.initials}
            color={player.color}
            seed={seedFromId(`${player.id}-avatar`)}
          />
          <div className={styles.playerName}>{player.name}</div>
        </div>

        <button
          className={`${styles.scoreDeltaButton} ${styles.minusButton}`}
          type="button"
          onClick={() => addQuickScore(-1)}
          aria-label={t("subtractOne", { name: player.name })}
        >
          <RoughBox
            color="rgba(203, 213, 225, 0.82)"
            seed={seedFromId(`${player.id}-minus`)}
          />
          <span>−1</span>
        </button>

        <div className={styles.scoreCell}>
          <button
            className={styles.scoreButton}
            style={{ fontSize: scoreFontSize(player.score) }}
            type="button"
            onClick={() => setIsDialogOpen(true)}
            aria-label={t("openScoreControls", { name: player.name })}
          >
            {player.score}
          </button>
          {pendingDelta !== 0 ? (
            <div
              className={
                pendingDelta > 0
                  ? styles.pendingPositive
                  : styles.pendingNegative
              }
            >
              {pendingDelta > 0 ? `+${pendingDelta}` : pendingDelta}
            </div>
          ) : null}
        </div>

        <button
          className={`${styles.scoreDeltaButton} ${styles.plusButton}`}
          type="button"
          onClick={() => addQuickScore(1)}
          aria-label={t("addOne", { name: player.name })}
        >
          <RoughBox
            color="color-mix(in srgb, var(--player-color) 72%, white 28%)"
            seed={seedFromId(`${player.id}-plus`)}
          />
          <span>+1</span>
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
    useWakeLock(store.settings.wakeLockEnabled);
    const sortLabel =
      sheet.sortDirection === "desc" ? t("highFirst") : t("lowFirst");

    return (
      <section className={styles.screen}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t("scoreSheet")}</p>
            <h1>{t("scores")}</h1>
          </div>
          <button
            className={styles.newButton}
            type="button"
            onClick={() => store.showNewSheet()}
          >
            {t("new")}
          </button>
        </header>

        <div className={styles.toolbar}>
          <span>
            {plural(sheet.players.length, "playersCount", "playersCountPlural")}
          </span>
          <div className={styles.sortControls}>
            <button
              className={`${styles.sortButton} ${styles.sortIconButton}`}
              type="button"
              onClick={() => sheet.toggleSortDirection()}
              aria-label={sortLabel}
              title={sortLabel}
            >
              {sheet.sortDirection === "desc" ? "▼" : "▲"}
            </button>
            <button
              className={styles.sortButton}
              type="button"
              onClick={() => sheet.sortPlayersByScore()}
            >
              {t("sort")}
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
