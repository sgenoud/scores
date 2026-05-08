import { Instance, SnapshotIn, cast, onSnapshot, types } from "mobx-state-tree";

const STORAGE_KEY = "board-game-scorekeeper-store-v1";

const colorPalette = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#eab308",
  "#6366f1",
  "#84cc16",
  "#f43f5e",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#d946ef",
  "#0ea5e9",
  "#65a30d",
  "#dc2626",
  "#7c3aed",
];

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const normalizeNames = (names: string[]) =>
  names
    .map((name) => name.trim().toLocaleLowerCase())
    .filter(Boolean)
    .join("|");

const makeGroupTitle = (names: string[]) => names.join(" · ");

export type ScoreEntrySource = "manual" | "quick";

export const ScoreEntryModel = types.model("ScoreEntry", {
  id: types.identifier,
  value: types.number,
  createdAt: types.number,
  source: types.optional(types.enumeration(["manual", "quick"]), "manual"),
});

export const PlayerModel = types
  .model("Player", {
    id: types.identifier,
    name: types.string,
    color: types.string,
    entries: types.optional(types.array(ScoreEntryModel), []),
  })
  .views((self) => ({
    get score() {
      return self.entries.reduce((sum, entry) => sum + entry.value, 0);
    },
    get initials() {
      const compactName = self.name.trim();
      if (!compactName) return "?";
      const parts = compactName.split(/\s+/);
      if (parts.length === 1) return compactName.slice(0, 2).toUpperCase();
      return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
    },
  }))
  .actions((self) => ({
    addValue(
      value: number,
      mergeWindowMs = 0,
      source: ScoreEntrySource = "manual",
    ) {
      const safeValue = Math.trunc(value);
      if (!Number.isFinite(safeValue) || safeValue === 0) return;

      const now = Date.now();
      const previousEntry = self.entries.at(-1);
      if (
        previousEntry &&
        previousEntry.source === source &&
        mergeWindowMs > 0 &&
        now - previousEntry.createdAt <= mergeWindowMs
      ) {
        previousEntry.value += safeValue;
        previousEntry.createdAt = now;

        if (previousEntry.value === 0) {
          self.entries.remove(previousEntry);
        }
        return;
      }

      self.entries.push(
        cast({
          id: randomId(),
          value: safeValue,
          createdAt: now,
          source,
        }),
      );
    },
    removeEntry(entryId: string) {
      const entry = self.entries.find((item) => item.id === entryId);
      if (entry) self.entries.remove(entry);
    },
  }));

export const PlayerTemplateModel = types.model("PlayerTemplate", {
  name: types.string,
  color: types.string,
});

export const SavedGroupModel = types
  .model("SavedGroup", {
    id: types.identifier,
    name: types.string,
    players: types.array(PlayerTemplateModel),
    lastPlayedAt: types.number,
    playCount: types.optional(types.number, 1),
  })
  .views((self) => ({
    get key() {
      return normalizeNames(self.players.map((player) => player.name));
    },
  }))
  .actions((self) => ({
    markPlayed() {
      self.lastPlayedAt = Date.now();
      self.playCount += 1;
    },
  }));

export const ScoreSheetModel = types
  .model("ScoreSheet", {
    id: types.identifier,
    title: types.string,
    createdAt: types.number,
    updatedAt: types.number,
    sortDirection: types.optional(types.enumeration(["desc", "asc"]), "desc"),
    keepScoreDialogOpen: types.optional(types.boolean, false),
    players: types.array(PlayerModel),
  })
  .actions((self) => ({
    touch() {
      self.updatedAt = Date.now();
    },
    toggleSortDirection() {
      self.sortDirection = self.sortDirection === "desc" ? "asc" : "desc";
      self.updatedAt = Date.now();
    },
    setKeepScoreDialogOpen(value: boolean) {
      self.keepScoreDialogOpen = value;
      self.updatedAt = Date.now();
    },
    sortPlayersByScore() {
      const direction = self.sortDirection === "desc" ? -1 : 1;
      const sortedPlayers = [...self.players].sort((a, b) => {
        const byScore = (a.score - b.score) * direction;
        if (byScore !== 0) return byScore;
        return a.name.localeCompare(b.name);
      });

      self.players.replace(sortedPlayers);
      self.updatedAt = Date.now();
    },
    addScore(
      playerId: string,
      value: number,
      mergeWindowMs = 0,
      source: ScoreEntrySource = "manual",
    ) {
      const player = self.players.find((item) => item.id === playerId);
      if (!player) return;
      player.addValue(value, mergeWindowMs, source);
      self.updatedAt = Date.now();
    },
    removeScoreEntry(playerId: string, entryId: string) {
      const player = self.players.find((item) => item.id === playerId);
      if (!player) return;
      player.removeEntry(entryId);
      self.updatedAt = Date.now();
    },
  }));

export const RootStoreModel = types
  .model("RootStore", {
    sheets: types.optional(types.array(ScoreSheetModel), []),
    savedGroups: types.optional(types.array(SavedGroupModel), []),
    currentSheetId: types.maybeNull(types.string),
  })
  .views((self) => ({
    get currentSheet() {
      return (
        self.sheets.find((sheet) => sheet.id === self.currentSheetId) ?? null
      );
    },
    get recentGroups() {
      return [...self.savedGroups].sort(
        (a, b) => b.lastPlayedAt - a.lastPlayedAt,
      );
    },
  }))
  .actions((self) => {
    const upsertGroup = (players: { name: string; color: string }[]) => {
      const key = normalizeNames(players.map((player) => player.name));
      const existing = self.savedGroups.find((group) => group.key === key);
      if (existing) {
        existing.markPlayed();
        return;
      }

      self.savedGroups.push(
        cast({
          id: randomId(),
          name: makeGroupTitle(players.map((player) => player.name)),
          players,
          lastPlayedAt: Date.now(),
          playCount: 1,
        }),
      );
    };

    const createSheetFromPlayers = (
      players: { name: string; color: string }[],
    ) => {
      const now = Date.now();
      const sheet = {
        id: randomId(),
        title: "",
        createdAt: now,
        updatedAt: now,
        sortDirection: "desc" as const,
        keepScoreDialogOpen: false,
        players: players.map((player) => ({
          id: randomId(),
          name: player.name,
          color: player.color,
          entries: [],
        })),
      };

      self.sheets.push(cast(sheet));
      self.currentSheetId = sheet.id;
      upsertGroup(players);
    };

    return {
      createSheet(names: string[]) {
        const trimmedNames = names.map((name) => name.trim()).filter(Boolean);
        const finalNames = trimmedNames.length > 0 ? trimmedNames : ["A", "B"];
        const players = finalNames.map((name, index) => ({
          name,
          color: colorPalette[index % colorPalette.length],
        }));
        createSheetFromPlayers(players);
      },
      createSheetFromGroup(groupId: string) {
        const group = self.savedGroups.find((item) => item.id === groupId);
        if (!group) return;
        createSheetFromPlayers(
          group.players.map((player) => ({
            name: player.name,
            color: player.color,
          })),
        );
      },
      showNewSheet() {
        self.currentSheetId = null;
      },
      selectSheet(sheetId: string) {
        if (self.sheets.some((sheet) => sheet.id === sheetId)) {
          self.currentSheetId = sheetId;
        }
      },
    };
  });

export type ScoreEntryInstance = Instance<typeof ScoreEntryModel>;
export type PlayerInstance = Instance<typeof PlayerModel>;
export type SavedGroupInstance = Instance<typeof SavedGroupModel>;
export type ScoreSheetInstance = Instance<typeof ScoreSheetModel>;
export type RootStoreInstance = Instance<typeof RootStoreModel>;
type RootSnapshot = SnapshotIn<typeof RootStoreModel>;

const defaultSnapshot: RootSnapshot = {
  sheets: [],
  savedGroups: [],
  currentSheetId: null,
};

const readSnapshot = (): RootSnapshot => {
  if (typeof window === "undefined") return defaultSnapshot;

  const rawSnapshot = window.localStorage.getItem(STORAGE_KEY);
  if (!rawSnapshot) return defaultSnapshot;

  try {
    return JSON.parse(rawSnapshot) as RootSnapshot;
  } catch {
    return defaultSnapshot;
  }
};

export const createScoreStore = () => {
  let store: RootStoreInstance;

  try {
    store = RootStoreModel.create(readSnapshot());
  } catch {
    store = RootStoreModel.create(defaultSnapshot);
  }

  if (typeof window !== "undefined") {
    onSnapshot(store, (snapshot) => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    });
  }

  return store;
};
