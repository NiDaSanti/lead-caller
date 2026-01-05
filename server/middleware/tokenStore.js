// Shared token store for the simple in-memory auth system.
// Kept as a separate module so both header-based and cookie-based auth can use it.
//
// NOTE: This is intentionally in-memory. In production across multiple instances,
// tokens and user mappings won't be shared. (A DB/Redis-backed session store solves that.)

export const activeTokens = new Set();

// Map token -> username for scoping per-user data stores (JSON files).
export const tokenUsers = new Map();

export function registerTokenUser(token, username) {
	if (!token) return;
	activeTokens.add(token);
	if (username) tokenUsers.set(token, String(username));
}

export function unregisterTokenUser(token) {
	if (!token) return;
	activeTokens.delete(token);
	tokenUsers.delete(token);
}

export function getUsernameForToken(token) {
	if (!token) return null;
	return tokenUsers.get(token) || null;
}
