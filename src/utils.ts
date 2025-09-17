export const lightenColor = (hex: string, percent: number) => {
  // Remove hash if present
  hex = hex.replace(/^#/, '');

  // Parse r,g,b
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  // Increase each channel by percent towards 255
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // Return new hex
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export const getOrdinal = (n: number) => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
};

const characterColors: { [key: string]: string } = {
  jules: '#23b0de',
  captain: '#23b0de',
  tina: '#dc2a27',
  marine: '#dc2a27',
  ariel: '#fdd627',
  engineer: '#fdd627',
  emilien: '#f48c26',
  scholar: '#f48c26',
  ira: '#19a557',
  medic: '#19a557',
  soren: '#794c9f',
  navigator: '#794c9f',
  '': 'gray',
};

export const getCharacterColor = (characterText: string): string => {
  const lowerText = characterText.toLowerCase();
  for (const key in characterColors) {
    if (lowerText.includes(key)) {
      return characterColors[key];
    }
  }
  return 'darkgray';
};
