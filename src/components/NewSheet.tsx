import { FormEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { plural, t } from "../i18n";
import { RootStoreInstance, SavedGroupInstance } from "../models/scoreStore";
import { seedFromText } from "../seed";
import { RoughAvatar } from "./RoughAvatar";
import { RoughSeparator } from "./RoughSeparator";
import { SettingsDialog } from "./SettingsDialog";
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

const groupTitle = (group: SavedGroupInstance) =>
  group.players.map((player) => player.name).join(" · ");

const DeleteConfirmDialog = ({
  group,
  onConfirm,
  onCancel,
}: {
  group: SavedGroupInstance;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div
    className={styles.sheetBackdrop}
    role="presentation"
    onClick={onCancel}
  >
    <section
      className={styles.confirmDialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      onClick={(event) => event.stopPropagation()}
    >
      <h3 id="confirm-delete-title">{t("deleteGroupConfirmTitle")}</h3>
      <div className={styles.confirmGroupPreview}>
        <strong>{groupTitle(group)}</strong>
        <div className={styles.confirmGroupPlayers}>
          {group.players.map((player, index) => (
            <RoughAvatar
              key={`confirm-${group.id}-${index}-${player.name}`}
              initials={initialsFor(player.name)}
              color={player.color}
              seed={seedFromText(`confirm-${group.id}-${index}-${player.name}-avatar`)}
              size="small"
            />
          ))}
        </div>
      </div>
      <p>{t("deleteGroupConfirmMessage")}</p>
      <div className={styles.confirmActions}>
        <button type="button" onClick={onCancel}>
          {t("cancel")}
        </button>
        <button
          className={styles.confirmDeleteButton}
          type="button"
          onClick={onConfirm}
        >
          {t("confirmDelete")}
        </button>
      </div>
    </section>
  </div>
);

const BinIcon = () => (
  <svg
    viewBox="0 0 3600 3600"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="m3099.9 600.05h-531.97l-174.94-437.07c-15.047-37.969-52.031-63-92.953-63h-999.97c-41.062 0-78.047 25.031-92.953 63l-174.94 437.07h-531.97c-54.984 0-99.984 45-99.984 99.984s45 99.984 99.984 99.984h199.97v2400c0 164.95 135 299.95 299.95 299.95h1600c164.95 0 299.95-135 299.95-299.95l-0.14062-2400h199.97c54.984 0 99.984-45 99.984-99.984s-45-99.984-99.984-99.984zm-1900 2199.9v-1500c0-54.984 45-99.984 99.984-99.984s99.984 45 99.984 99.984v1500c0 54.984-45 99.984-99.984 99.984s-99.984-45-99.984-99.984zm500.07 0v-1500c0-54.984 45-99.984 99.984-99.984s99.984 45 99.984 99.984v1500c0 54.984-45 99.984-99.984 99.984s-99.984-45-99.984-99.984zm700.02 0c0 54.984-45 99.984-99.984 99.984s-99.984-45-99.984-99.984v-1500c0-54.984 45-99.984 99.984-99.984s99.984 45 99.984 99.984zm-1032-2500h864l119.95 299.95h-1104l119.95-299.95z" />
  </svg>
);

const GroupCard = observer(
  ({
    group,
    onPlay,
    onDelete,
  }: {
    group: SavedGroupInstance;
    onPlay: () => void;
    onDelete: () => void;
  }) => (
    <div className={styles.groupCard}>
      <RoughSeparator seed={seedFromText(`${group.id}-separator`)} />
      <button
        className={styles.groupPlayArea}
        type="button"
        onClick={onPlay}
      >
        <div className={styles.groupHeader}>
          <strong>{groupTitle(group)}</strong>
        </div>
        <div className={styles.groupPlayers}>
          {group.players.map((player, index) => (
            <RoughAvatar
              key={`${group.id}-${index}-${player.name}`}
              initials={initialsFor(player.name)}
              color={player.color}
              seed={seedFromText(`${group.id}-${index}-${player.name}-avatar`)}
              size="small"
            />
          ))}
        </div>
      </button>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        aria-label={t("confirmDelete")}
        title={t("confirmDelete")}
      >
        <BinIcon />
      </button>
    </div>
  ),
);

export const NewSheet = observer(({ store }: { store: RootStoreInstance }) => {
  const [namesText, setNamesText] = useState("");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [groupToDelete, setGroupToDelete] =
    useState<SavedGroupInstance | null>(null);
  const recentGroups = store.recentGroups;
  const latestGroups = recentGroups.slice(0, 5);
  const recentSheet =
    store.sheets.length > 0
      ? [...store.sheets].sort((a, b) => b.updatedAt - a.updatedAt)[0]
      : null;

  useEffect(() => {
    if (showAllGroups || showSettings || groupToDelete) {
      document.body.classList.add("dialogOpen");
    } else {
      document.body.classList.remove("dialogOpen");
    }
    return () => {
      document.body.classList.remove("dialogOpen");
    };
  }, [showAllGroups, showSettings, groupToDelete]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    store.createSheet(splitNames(namesText));
  };

  return (
    <section className={styles.screen}>
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <p className={styles.eyebrow}>{t("offlineScorekeeper")}</p>
          <button
            className={styles.settingsButton}
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label={t("settings")}
          >
            <svg
              viewBox="0 0 3600 3600"
              xmlns="http://www.w3.org/2000/svg"
              width="1.15em"
              height="1.15em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="m3392 2151.2c-243.36-96.371-331.16-189.11-331.16-351.25s87.805-254.88 331.2-351.25c19.547-7.7773 31.895-30.348 26.82-50.762-40.5-163.69-105.16-317.77-189.97-458.35-10.871-18-35.605-25.273-54.938-16.922-240.16 103.89-367.78 100.4-482.36-14.219-114.62-114.62-118.12-242.24-14.258-482.4 8.3164-19.332 1.043-44.027-16.992-54.898-140.54-84.852-294.62-149.51-458.28-190.01-20.41-5.0742-43.02 7.3086-50.762 26.855-96.406 243.32-189.11 331.13-351.25 331.13-162.14 0-254.88-87.805-351.21-331.13-7.7383-19.547-30.312-31.934-50.762-26.855-163.66 40.5-317.77 105.16-458.39 190.01-18 10.871-25.273 35.566-16.922 54.898 103.89 240.16 100.4 367.78-14.258 482.4-114.59 114.62-242.21 118.12-482.36 14.219-19.297-8.3516-44.062-1.0781-54.898 16.922-84.816 140.58-149.51 294.66-190.01 458.28-5.0742 20.41 7.3086 43.055 26.82 50.832 243.39 96.371 331.23 189.11 331.23 351.25s-87.805 254.88-331.2 351.25c-19.512 7.7383-31.895 30.383-26.82 50.832 40.5 163.66 105.16 317.73 189.97 458.32 10.906 18 35.605 25.273 54.898 16.922 240.16-103.89 367.78-100.4 482.36 14.219 114.66 114.66 118.15 242.24 14.258 482.47-8.3516 19.297-1.1172 44.027 16.922 54.898 140.58 84.852 294.66 149.54 458.32 190.08 20.41 5.0391 43.055-7.2734 50.797-26.82 96.27-243.54 189.04-331.38 351.22-331.38s254.95 87.84 351.29 331.34c7.7383 19.547 30.312 31.895 50.723 26.82 163.69-40.535 317.77-105.19 458.39-190.04 18-10.871 25.234-35.605 16.883-54.898-103.89-240.19-100.37-367.81 14.258-482.44 114.62-114.66 242.24-118.15 482.36-14.258 19.332 8.3516 44.102 1.0781 54.938-16.922 84.816-140.62 149.44-294.66 189.94-458.32 5.0742-20.445-7.2383-43.086-26.785-50.828zm-1592 314.79c-367.81 0-666-298.22-666-666.04s298.19-666.04 666-666.04 666 298.22 666 666.04-298.19 666.04-666 666.04z" />
            </svg>
          </button>
        </div>
        <h1>{t("startSheetFast")}</h1>
        <p className={styles.lede}>{t("newSheetLede")}</p>
      </header>

      {recentSheet ? (
        <button
          className={styles.continueButton}
          type="button"
          onClick={() => store.selectSheet(recentSheet.id)}
        >
          {t("continueScoreSheet")}
        </button>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.groupGrid}>
          {latestGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onPlay={() => store.createSheetFromGroup(group.id)}
              onDelete={() => setGroupToDelete(group)}
            />
          ))}
        </div>

        {recentGroups.length > latestGroups.length ? (
          <button
            className={styles.allGroupsRow}
            type="button"
            onClick={() => setShowAllGroups(true)}
          >
            <RoughSeparator seed={seedFromText("all-groups-separator")} />
            <span>{t("seeAllGroups")}</span>
            <small>
              {plural(
                recentGroups.length,
                "savedGroupsCount",
                "savedGroupsCountPlural",
              )}
            </small>
          </button>
        ) : null}

        <form className={styles.newGroupForm} onSubmit={handleSubmit}>
          <label className={styles.label}>
            {t("players")}
            <textarea
              value={namesText}
              onChange={(event) => setNamesText(event.target.value)}
              placeholder={t("playersPlaceholder")}
              rows={6}
            />
          </label>

          <div className={styles.newGroupFooter}>
            <span>
              {plural(
                splitNames(namesText).length,
                "playersCount",
                "playersCountPlural",
              )}
            </span>
            <button className={styles.startButton} type="submit">
              {t("createScoreSheet")}
            </button>
          </div>
        </form>
      </section>

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
                <p className={styles.eyebrow}>{t("previousGroups")}</p>
                <h2 id="all-groups-title">{t("allGroups")}</h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={() => setShowAllGroups(false)}
                aria-label={t("closeAllGroups")}
              >
                ×
              </button>
            </header>
            <p className={styles.allGroupsCount}>
              {plural(
                recentGroups.length,
                "savedGroupsCount",
                "savedGroupsCountPlural",
              )}
            </p>
            <div className={styles.groupGrid}>
              {recentGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPlay={() => store.createSheetFromGroup(group.id)}
                  onDelete={() => setGroupToDelete(group)}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {showSettings ? (
        <SettingsDialog
          store={store}
          onClose={() => setShowSettings(false)}
        />
      ) : null}

      {groupToDelete ? (
        <DeleteConfirmDialog
          group={groupToDelete}
          onConfirm={() => {
            store.removeGroup(groupToDelete.id);
            setGroupToDelete(null);
          }}
          onCancel={() => setGroupToDelete(null)}
        />
      ) : null}
    </section>
  );
});
