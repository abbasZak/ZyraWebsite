const CUSTOM_TOKENS_KEY = 'custom_tokens';

export interface CustomToken {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  icon?: string;
}

export const addCustomToken = (token: CustomToken): void => {
  const existing = getCustomTokens();
  const updated = [...existing, token];
  localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(updated));
};

export const getCustomTokens = (): CustomToken[] => {
  const stored = localStorage.getItem(CUSTOM_TOKENS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const removeCustomToken = (mint: string): void => {
  const existing = getCustomTokens();
  const filtered = existing.filter(t => t.mint !== mint);
  localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(filtered));
};