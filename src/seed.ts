export const seedFromText = (text: string) =>
  [...text].reduce((seed, character) => (seed * 31 + character.charCodeAt(0)) % 2_147_483_647, 17);
