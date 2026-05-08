import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { plural, t } from '../i18n';
import { RootStoreInstance, SavedGroupInstance } from '../models/scoreStore';
import styles from './NewSheet.module.css';

const splitNames = (text: string) =>
  text
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

const initialsFor = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const GroupCard = observer(({ group, onPlay }: { group: SavedGroupInstance; onPlay: () => void }) => (
  <button className={styles.groupCard} type="button" onClick={onPlay}>
    <div className={styles.groupHeader}>
      <strong>{group.name}</strong>
      <span>{group.playCount}×</span>
    </div>
    <div className={styles.groupPlayers}>
      {group.players.map((player, index) => (
        <span
          key={`${group.id}-${index}-${player.name}`}
          style={{ '--player-color': player.color } as CSSProperties}
        >
          {initialsFor(player.name)}
        </span>
      ))}
    </div>
  </button>
));

export const NewSheet = observer(({ store }: { store: RootStoreInstance }) => {
  const [namesText, setNamesText] = useState('');
  const [showAllGroups, setShowAllGroups] = useState(false);
  const recentGroups = store.recentGroups;
  const latestGroups = recentGroups.slice(0, 5);
  const recentSheet =
    store.sheets.length > 0 ? [...store.sheets].sort((a, b) => b.updatedAt - a.updatedAt)[0] : null;

  useEffect(() => {
    if (!showAllGroups) return;
    document.body.classList.add('dialogOpen');
    return () => document.body.classList.remove('dialogOpen');
  }, [showAllGroups]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    store.createSheet(splitNames(namesText));
  };

  return (
    <section className={styles.screen}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('offlineScorekeeper')}</p>
        <h1>{t('startSheetFast')}</h1>
        <p className={styles.lede}>{t('newSheetLede')}</p>
      </header>

      {recentSheet ? (
        <button
          className={styles.continueButton}
          type="button"
          onClick={() => store.selectSheet(recentSheet.id)}
        >
          {t('continueScoreSheet')}
        </button>
      ) : null}

      {recentGroups.length > 0 ? (
        <section className={styles.panel}>
          <div className={styles.panelTitle}>
            <h2>{t('latestGroups')}</h2>
            <div className={styles.panelActions}>
              <span>{t('tapToStart')}</span>
              {recentGroups.length > latestGroups.length ? (
                <button
                  className={styles.allGroupsButton}
                  type="button"
                  onClick={() => setShowAllGroups(true)}
                >
                  {t('all')}
                </button>
              ) : null}
            </div>
          </div>
          <div className={styles.groupGrid}>
            {latestGroups.map((group) => (
              <GroupCard key={group.id} group={group} onPlay={() => store.createSheetFromGroup(group.id)} />
            ))}
          </div>
        </section>
      ) : null}

      <form className={styles.panel} onSubmit={handleSubmit}>
        <div className={styles.panelTitle}>
          <h2>{t('newGroup')}</h2>
          <span>{plural(splitNames(namesText).length, 'playersCount', 'playersCountPlural')}</span>
        </div>

        <label className={styles.label}>
          {t('players')}
          <textarea
            value={namesText}
            onChange={(event) => setNamesText(event.target.value)}
            placeholder={t('playersPlaceholder')}
            rows={6}
          />
        </label>

        <button className={styles.startButton} type="submit">
          {t('createScoreSheet')}
        </button>
      </form>

      {showAllGroups ? (
        <div className={styles.sheetBackdrop} role="presentation" onClick={() => setShowAllGroups(false)}>
          <section
            className={styles.allGroupsSheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-groups-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.sheetHeader}>
              <div>
                <p className={styles.eyebrow}>{t('previousGroups')}</p>
                <h2 id="all-groups-title">{t('allGroups')}</h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setShowAllGroups(false)}
                aria-label={t('closeAllGroups')}
              >
                ×
              </button>
            </header>
            <p className={styles.allGroupsCount}>
              {plural(recentGroups.length, 'savedGroupsCount', 'savedGroupsCountPlural')}
            </p>
            <div className={styles.groupGrid}>
              {recentGroups.map((group) => (
                <GroupCard key={group.id} group={group} onPlay={() => store.createSheetFromGroup(group.id)} />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
});
