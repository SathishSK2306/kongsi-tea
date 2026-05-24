export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const genId = (prefix: string) =>
  `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

const STORE_ID_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const STORE_ID_DIGITS = "0123456789";
const STORE_PASSWORD_SYMBOLS = "!@#$%";

function randomIndex(max: number) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function shuffle(value: string[]) {
  const items = [...value];

  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

export function generateStoreId() {
  const digits = Array.from({ length: 4 }, () => STORE_ID_DIGITS[randomIndex(STORE_ID_DIGITS.length)]);
  const letters = Array.from({ length: 4 }, () => STORE_ID_LETTERS[randomIndex(STORE_ID_LETTERS.length)]);

  return `KONG${shuffle([...digits, ...letters]).join("")}`.toUpperCase();
}

export function formatSequentialStoreId(sequence: number) {
  return `KONG${String(sequence).padStart(4, "0")}`;
}

export function generateStorePassword() {
  const required = [
    STORE_ID_LETTERS[randomIndex(STORE_ID_LETTERS.length)],
    STORE_ID_LETTERS[randomIndex(STORE_ID_LETTERS.length)].toLowerCase(),
    STORE_ID_DIGITS[randomIndex(STORE_ID_DIGITS.length)],
    STORE_PASSWORD_SYMBOLS[randomIndex(STORE_PASSWORD_SYMBOLS.length)],
  ];
  const all = `${STORE_ID_LETTERS}${STORE_ID_LETTERS.toLowerCase()}${STORE_ID_DIGITS}${STORE_PASSWORD_SYMBOLS}`;
  const rest = Array.from({ length: 5 }, () => all[randomIndex(all.length)]);

  return shuffle([...required, ...rest]).join("");
}
