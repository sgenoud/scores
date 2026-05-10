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
              className={styles.sortIconButton}
              type="button"
              data-stale={!sheet.isSortedByScore}
              onClick={() => {
                if (sheet.isSortedByScore) {
                  sheet.toggleSortDirection();
                }
                sheet.sortPlayersByScore();
              }}
              aria-label={sortLabel}
              title={sortLabel}
            >
              <svg
                className={styles.sortIcon}
                style={
                  sheet.sortDirection === "desc"
                    ? { transform: "scaleY(-1)" }
                    : undefined
                }
                viewBox="0 0 3600 3600"
                xmlns="http://www.w3.org/2000/svg"
                width="1.35em"
                height="1.35em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="m3276.1 2812.5c56.109 0 109.83 22.219 149.48 61.875 39.652 39.656 61.875 93.375 61.875 149.48v245.95c0 55.969-22.219 109.83-61.875 149.48s-93.375 61.875-149.48 61.875h-1152.3c-56.109 0-109.83-22.219-149.48-61.875s-61.875-93.516-61.875-149.48v-245.95c0-56.109 22.219-109.83 61.875-149.48 39.656-39.652 93.375-61.875 149.48-61.875z" fill-rule="evenodd" />
                <path d="m2938.6 1746.8c56.109 0 109.83 22.219 149.48 61.875s61.875 93.516 61.875 149.48v245.95c0 55.969-22.219 109.83-61.875 149.48s-93.375 61.875-149.48 61.875h-814.79c-56.109 0-109.83-22.219-149.48-61.875s-61.875-93.516-61.875-149.48v-245.95c0-55.969 22.219-109.83 61.875-149.48s93.375-61.875 149.48-61.875z" fill-rule="evenodd" />
                <path d="m2601.1 681.34c116.72 0 211.36 94.641 211.36 211.36v245.95c0 116.72-94.641 211.36-211.36 211.36h-477.29c-116.72 0-211.36-94.641-211.36-211.36v-245.95c0-116.72 94.641-211.36 211.36-211.36z" fill-rule="evenodd" />
                <path d="m501.77 1936.3c7.0312 0 12.797-5.7656 12.938-12.797v-1573c0-131.34 106.45-237.94 237.8-237.94h351.28c131.34 0 237.94 106.59 237.94 237.94v1573c0 7.0312 5.7656 12.797 12.938 12.797h151.17c85.781 0 164.81 46.125 207.14 120.66 42.188 74.531 41.062 166.22-3.0938 239.62l-577.69 962.86c-43.031 71.719-120.52 115.59-204.05 115.59s-161.02-43.875-203.91-115.59l-577.84-962.86c-44.156-73.406-45.281-165.09-2.9531-239.62 42.188-74.531 121.22-120.66 207-120.66z" fill-rule="evenodd" />
              </svg>
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
