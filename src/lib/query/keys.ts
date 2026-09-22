export const queryKeys = {
  accounts: (userId?: string) => ["account", userId] as const,
  budgets: (userId?: string) => ["budget", userId] as const,
  transactions: (userId?: string) => ["transaction", userId] as const,
};
