import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RootStoreInstance, SavedGroupInstance } from "../models/scoreStore";
import styles from "./NewSheet.module.css";

const splitNames = (text: string) =>
  text
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

const GroupCard = observer(
  ({ group, onPlay }: { group: SavedGroupInstance; onPlay: () => void }) => (
    <button className={styles.groupCard} type="button" onClick={onPlay}>
      <div className={styles.groupHeader}>
        <strong>{group.name}</strong>
        <span>{group.playCount}×</span>
      </div>
      <div className={styles.groupPlayers}>
        {group.players.map((player, index) => (
          <span
            key={`${group.id}-${index}-${player.name}`}
            style={{ "--player-color": player.color } as CSSProperties}
          >
            {initialsFor(player.name)}
          </span>
        ))}
      </div>
    </button>
  ),
);

export const NewSheet = observer(({ store }: { store: RootStoreInstance }) => {
  const [namesText, setNamesText] = useState("A\nB\nC\nD");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const recentGroups = store.recentGroups;
  const latestGroups = recentGroups.slice(0, 5);
  const recentSheet =
    store.sheets.length > 0
      ? [...store.sheets].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      : null;

  useEffect(() => {
    if (!showAllGroups) return;
    document.body.classList.add("dialogOpen");
    return () => document.body.classList.remove("dialogOpen");
  }, [showAllGroups]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    store.createSheet(splitNames(namesText));
  };

  return (
    <section className={styles.screen}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Offline scorekeeper</p>
        <h1>Start a score sheet fast.</h1>
        <p className={styles.lede}>
          Reuse a previous group or enter short player names. Everything is
          stored on this device.
        </p>
      </header>

      {recentSheet ? (
        <button
          className={styles.continueButton}
          type="button"
          onClick={() => store.selectSheet(recentSheet.id)}
        >
          Continue score sheet
        </button>
      ) : null}

      {recentGroups.length > 0 ? (
        <section className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>Latest groups</h2>
            <div className={styles.panelActions}>
              <span>tap to start</span>
              {recentGroups.length > latestGroups.length ? (
                <button
                  className={styles.allGroupsButton}
                  type="button"
                  onClick={() => setShowAllGroups(true)}
                >
                  All
                </button>
              ) : null}
            </div>
          </div>
          <div className={styles.groupGrid}>
            {latestGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPlay={() => store.createSheetFromGroup(group.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelTitle}>
          <h2>New group</h2>
          <span>{splitNames(namesText).length} players</span>
        </div>

        <label className={styles.label}>
          Players
          <textarea
            value={namesText}
            onChange={(event) => setNamesText(event.target.value)}
            placeholder={"One per line, e.g.\nA\nBG\nSam"}
            rows={6}
          />
        </label>

        <button className={styles.startButton} type="submit">
          Create score sheet
        </button>
      </form>

      {showAllGroups ? (
        <div
          className={styles.sheetBackdrop}
          role="presentation"
          onClick={() => setShowAllGroups(false)}
        >
          <section
            className={styles.allGroupsSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-groups-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.sheetHeader}>
              <div>
                <p className={styles.eyebrow}>Previous groups</p>
                <h2 id="all-groups-title">All groups</h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setShowAllGroups(false)}
                aria-label="Close all groups"
              >
                ×
              </button>
            </header>
            <p className={styles.allGroupsCount}>
              {recentGroups.length} saved groups
            </p>
            <div className={styles.groupGrid}>
              {recentGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPlay={() => store.createSheetFromGroup(group.id)}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
});
