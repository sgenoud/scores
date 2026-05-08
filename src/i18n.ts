const SUPPORTED_LANGS = ['fr', 'en'] as const;

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const MESSAGES = {
  fr: {
    documentTitle: 'Scores de jeux',
    offlineScorekeeper: 'Scores hors ligne',
    startSheetFast: 'Vite une feuille de score.',
    newSheetLede:
      'Réutilisez un groupe précédent ou entrez des noms courts. Tout est enregistré sur cet appareil.',
    continueScoreSheet: 'Continuer la feuille',
    latestGroups: 'Groupes récents',
    tapToStart: 'touchez pour démarrer',
    all: 'Tous',
    newGroup: 'Nouveau groupe',
    playersCount: '{count} joueur',
    playersCountPlural: '{count} joueurs',
    players: 'Joueurs',
    playersPlaceholder: 'Un par ligne, ex.\nA\nBG\nSam',
    createScoreSheet: 'Créer la feuille de scores',
    previousGroups: 'Groupes précédents',
    allGroups: 'Tous les groupes',
    savedGroupsCount: '{count} groupe enregistré',
    savedGroupsCountPlural: '{count} groupes enregistrés',
    closeAllGroups: 'Fermer tous les groupes',
    scoreSheet: 'Feuille de scores',
    scores: 'Scores',
    new: 'Nouvelle',
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
    offlineScorekeeper: 'Offline scorekeeper',
    startSheetFast: 'Quick a new score sheet.',
    newSheetLede: 'Reuse a previous group or enter short player names. Everything is stored on this device.',
    continueScoreSheet: 'Continue score sheet',
    latestGroups: 'Latest groups',
    tapToStart: 'tap to start',
    all: 'All',
    newGroup: 'New group',
    playersCount: '{count} player',
    playersCountPlural: '{count} players',
    players: 'Players',
    playersPlaceholder: 'One per line, e.g.\nA\nBG\nSam',
    createScoreSheet: 'Create score sheet',
    previousGroups: 'Previous groups',
    allGroups: 'All groups',
    savedGroupsCount: '{count} saved group',
    savedGroupsCountPlural: '{count} saved groups',
    closeAllGroups: 'Close all groups',
    scoreSheet: 'Score sheet',
    scores: 'Scores',
    new: 'New',
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
