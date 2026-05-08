const SUPPORTED_LANGS = ['fr', 'en'] as const;

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const MESSAGES = {
  fr: {
    documentTitle: 'Scores de jeux',
    offlineScorekeeper: 'Scores',
    startSheetFast: 'Nouvelle partie',
    newSheetLede: 'Reprenez un groupe ou créez une nouvelle table.',
    continueScoreSheet: 'Reprendre la partie',
    latestGroups: 'Groupes récents',
    tapToStart: 'touchez pour démarrer',
    all: 'Tous',
    seeAllGroups: 'Voir tous les groupes',
    newGroup: 'Nouveau groupe',
    playersCount: '{count} joueur',
    playersCountPlural: '{count} joueurs',
    players: 'Joueurs',
    playersPlaceholder: 'A\nB\nC\nD',
    createScoreSheet: 'Créer la feuille de scores',
    previousGroups: 'Groupes précédents',
    allGroups: 'Tous les groupes',
    savedGroupsCount: '{count} groupe enregistré',
    savedGroupsCountPlural: '{count} groupes enregistrés',
    closeAllGroups: 'Fermer tous les groupes',
    scoreSheet: 'Feuille de scores',
    scores: 'Scores',
    new: 'Nouvelle',
    wakeLockOn: 'Écran éveillé',
    wakeLockOff: 'Veille autorisée',
    wakeLockEnable: 'Garder l’écran éveillé',
    wakeLockDisable: 'Autoriser la veille',
    highFirst: 'Plus hauts',
    lowFirst: 'Plus bas',
    sort: 'Trier',
    subtractOne: 'Retirer 1 à {name}',
    addOne: 'Ajouter 1 à {name}',
    openScoreControls: 'Ouvrir les contrôles de score pour {name}',
    adjustScore: 'Modifier le score',
    closeScoreDialog: 'Fermer le menu de score',
    value: 'Valeur',
    scoreValue: 'Valeur du score',
    keepMenuOpen: 'Garder le menu ouvert après modification',
    delete: 'Retirer',
    add: 'Ajouter',
    recentChanges: 'Modifications récentes',
    noScoreChanges: 'Aucune modification pour le moment.',
    undo: 'Annuler',
  },
  en: {
    documentTitle: 'Board Game Scores',
    offlineScorekeeper: 'Scores',
    startSheetFast: 'New game',
    newSheetLede: 'Pick up a group or create a new table.',
    continueScoreSheet: 'Resume game',
    latestGroups: 'Latest groups',
    tapToStart: 'tap to start',
    all: 'All',
    seeAllGroups: 'See all groups',
    newGroup: 'New group',
    playersCount: '{count} player',
    playersCountPlural: '{count} players',
    players: 'Players',
    playersPlaceholder: 'A\nB\nC\nD',
    createScoreSheet: 'Create score sheet',
    previousGroups: 'Previous groups',
    allGroups: 'All groups',
    savedGroupsCount: '{count} saved group',
    savedGroupsCountPlural: '{count} saved groups',
    closeAllGroups: 'Close all groups',
    scoreSheet: 'Score sheet',
    scores: 'Scores',
    new: 'New',
    wakeLockOn: 'Screen awake',
    wakeLockOff: 'Sleep allowed',
    wakeLockEnable: 'Keep screen awake',
    wakeLockDisable: 'Allow screen sleep',
    highFirst: 'High first',
    lowFirst: 'Low first',
    sort: 'Sort',
    subtractOne: 'Subtract 1 from {name}',
    addOne: 'Add 1 to {name}',
    openScoreControls: 'Open score controls for {name}',
    adjustScore: 'Adjust score',
    closeScoreDialog: 'Close score dialog',
    value: 'Value',
    scoreValue: 'Score value',
    keepMenuOpen: 'Keep menu open after change',
    delete: 'Delete',
    add: 'Add',
    recentChanges: 'Recent changes',
    noScoreChanges: 'No score changes yet.',
    undo: 'Undo',
  },
} as const;

type TranslationKey = keyof (typeof MESSAGES)['fr'];

type Interpolation = Record<string, string | number>;

const normalizeLanguage = (value: string | null | undefined) => {
  if (!value) return null;
  return value.toLowerCase().split('-')[0];
};

const isSupportedLang = (value: string | null): value is SupportedLang =>
  SUPPORTED_LANGS.includes(value as SupportedLang);

export const getPreferredLanguage = (): SupportedLang => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryLang = normalizeLanguage(params.get('lang'));
    if (isSupportedLang(queryLang)) return queryLang;
  }

  if (typeof navigator !== 'undefined') {
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const browserLanguage of browserLanguages) {
      const normalizedLanguage = normalizeLanguage(browserLanguage);
      if (isSupportedLang(normalizedLanguage)) return normalizedLanguage;
    }
  }

  return 'fr';
};

export const currentLang = getPreferredLanguage();
const currentMessages = MESSAGES[currentLang] ?? MESSAGES.fr;

export const t = (key: TranslationKey, values: Interpolation = {}) => {
  let message: string = currentMessages[key];

  for (const [name, value] of Object.entries(values)) {
    message = message.replaceAll(`{${name}}`, String(value));
  }

  return message;
};

export const plural = (
  count: number,
  singularKey: TranslationKey,
  pluralKey: TranslationKey,
  values: Interpolation = {},
) => t(count === 1 ? singularKey : pluralKey, { count, ...values });

if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang;
  document.title = t('documentTitle');
}
