import { currentLang } from "./i18n";

const universalGroups = [
  ["John", "Paul", "George", "Ringo"],
  ["Han", "Luke", "Leia", "Chewie"],
  ["Frodo", "Sam", "Merry", "Pippin"],
  ["Leonardo", "Michelangelo", "Donatello", "Raphael"],
  ["Mario", "Luigi", "Peach", "Toad"],
  ["Neo", "Trinity", "Morpheus"],
  ["Mulder", "Scully"],
  ["Homer", "Marge", "Bart", "Lisa"],
  ["Sheldon", "Leonard", "Penny", "Raj"],
  ["Gandalf", "Aragorn", "Legolas", "Gimli"],
  ["Tyrion", "Jaime", "Cersei"],
  ["Kirk", "Spock", "McCoy", "Scotty"],
  ["Rick", "Morty"],
  ["Arya", "Sansa", "Jon", "Bran"],
  ["Batman", "Robin"],
  ["Marty", "Doc"],
  ["Wallace", "Gromit"],
  ["Calvin", "Hobbes"],
  ["Bonnie", "Clyde"],
  ["Laurel", "Hardy"],
  ["Simon", "Garfunkel"],
  ["Sherlock", "Watson"],
  ["Tom", "Jerry"],
  ["Harry", "Ron", "Hermione"],
  ["Athos", "Porthos", "Aramis"],
  ["Timon", "Pumbaa", "Simba"],
  ["Woody", "Buzz", "Jessie", "Rex"],
  ["Kramer", "Jerry", "George", "Elaine"],
  ["Monica", "Chandler", "Rachel", "Ross", "Phoebe", "Joey"],
  ["Cyclops", "Wolverine", "Storm", "Jean", "Beast"],
  ["Thom", "Jonny", "Colin", "Ed", "Phil"],
  ["Johnny", "Sid", "Steve", "Paul"],
  ["Bono", "The Edge", "Adam", "Larry"],
  ["Jack", "Meg"],
  ["Mick", "Keith", "Charlie", "Ronnie"],
  ["Agnetha", "Björn", "Benny", "Anni-Frid"],
  ["Mel B", "Mel C", "Emma", "Geri", "Victoria"],
] as const;

const localizedGroups: Record<string, string[][]> = {
  fr: [
    ["Feuille", "Caillou", "Ciseaux"],
    ["X", "O"],
    ["Roi", "Dame", "Tour", "Fou"],
    ["Voiture", "Chien", "Chapeau", "Bateau"],
    ["Bois", "Brique", "Mouton", "Blé"],
    ["Écarlate", "Moutarde", "Blanche", "Vert", "Paon", "Prune"],
    ["Chevalier", "Voleur", "Paysan", "Moine"],
    ["Médecin", "Scientifique", "Chercheur", "Dispatcheur"],
    ["Guerrier", "Mage", "Voleur", "Clerc"],
    ["Loup-Garou", "Voyante", "Villageois"],
  ],
  en: [
    ["Rock", "Paper", "Scissors"],
    ["X", "O"],
    ["King", "Queen", "Rook", "Bishop"],
    ["Car", "Dog", "Hat", "Ship"],
    ["Wood", "Brick", "Sheep", "Wheat"],
    ["Scarlet", "Mustard", "White", "Green", "Peacock", "Plum"],
    ["Knight", "Thief", "Farmer", "Monk"],
    ["Medic", "Scientist", "Researcher", "Dispatcher"],
    ["Fighter", "Wizard", "Rogue", "Cleric"],
    ["Werewolf", "Seer", "Villager"],
  ],
};

export const getRandomWhimsyPlaceholder = (): string => {
  const localized = localizedGroups[currentLang] ?? localizedGroups.fr;
  const allGroups = [...universalGroups, ...localized];
  const group = allGroups[Math.floor(Math.random() * allGroups.length)];
  return group.join("\n");
};
