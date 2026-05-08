import { observer } from "mobx-react-lite";
import { RootStoreInstance } from "../models/scoreStore";
import { t } from "../i18n";
import { isWakeLockSupported } from "../useWakeLock";
import styles from "./SettingsDialog.module.css";

export const SettingsDialog = observer(
  ({
    store,
    onClose,
  }: {
    store: RootStoreInstance;
    onClose: () => void;
  }) => {
    const handleLanguageChange = (lang: "auto" | "fr" | "en") => {
      store.settings.setLanguage(lang);
      window.location.reload();
    };

    return (
      <div className={styles.backdrop} role="presentation" onClick={onClose}>
        <section
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>{t("offlineScorekeeper")}</p>
              <h2 id="settings-title">{t("settings")}</h2>
            </div>
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
              aria-label={t("closeSettings")}
            >
              ×
            </button>
          </header>

          <div className={styles.section}>
            <h3>{t("language")}</h3>
            <div className={styles.segmentedControl}>
              {(
                [
                  { value: "auto", label: t("languageAuto") },
                  { value: "fr", label: "Français" },
                  { value: "en", label: "English" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.segmentButton} ${store.settings.language === option.value ? styles.segmentActive : ""}`}
                  onClick={() => handleLanguageChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {isWakeLockSupported() ? (
            <div className={styles.section}>
              <h3>{t("wakeLockEnable")}</h3>
              <button
                type="button"
                className={`${styles.toggleButton} ${store.settings.wakeLockEnabled ? styles.toggleActive : ""}`}
                onClick={() => store.settings.toggleWakeLock()}
                aria-pressed={store.settings.wakeLockEnabled}
              >
                <span className={styles.toggleTrack}>
                  <span className={styles.toggleThumb} />
                </span>
                <span className={styles.toggleLabel}>
                  {store.settings.wakeLockEnabled
                    ? t("wakeLockOn")
                    : t("wakeLockOff")}
                </span>
              </button>
            </div>
          ) : null}
        </section>
      </div>
    );
  },
);
