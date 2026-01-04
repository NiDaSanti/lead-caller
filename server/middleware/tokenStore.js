// Shared token store for the simple in-memory auth system.
// Kept as a separate module so both header-based and cookie-based auth can use it.

export const activeTokens = new Set();
