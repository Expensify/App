/** Pure compound-key derivation for PUSH_PARAMS history entries. Split out so `addPushParamsRouterExtension` can use it on native without pulling in the DOM-side focus-return machinery. */

// NUL — never appears in route keys or JSON-stringified params, so no chance of collision.
const COMPOUND_KEY_DELIMITER = '\x00';

// Sentinel so JSON.stringify can't collapse [undefined] → [null].
const UNDEFINED_SENTINEL = '\u0000undefined';

// URL-rehydrated params are always strings; PUSH_PARAMS dispatches may use numbers/booleans.
// Top-level undefined is dropped by the caller's filter; nested undefined is preserved via UNDEFINED_SENTINEL — asymmetric but inert (URL params are flat).
// Assumes JSON-serializable params — non-plain objects (Date/RegExp) collapse to {} via Object.entries, acceptable since PUSH_PARAMS only carries URL-backed params.
function normalizeForKey(value: unknown): unknown {
    if (value === null) {
        return null;
    }
    if (value === undefined) {
        return UNDEFINED_SENTINEL;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(normalizeForKey);
    }
    if (typeof value === 'object') {
        // Recursively sort so differently-ordered nested keys produce the same compound.
        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([a], [b]) => {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            })
            .map(([k, v]) => [k, normalizeForKey(v)]);
        return Object.fromEntries(entries);
    }
    return value;
}

/** Compound key for PUSH_PARAMS history (same route.key across params snapshots). */
function compoundParamsKey(routeKey: string, params: unknown): string {
    if (params == null) {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}`;
    }
    if (typeof params !== 'object') {
        return `${routeKey}${COMPOUND_KEY_DELIMITER}${JSON.stringify(normalizeForKey(params))}`;
    }
    // Explicit-undefined fields must match path-rehydrated (omitted) params.
    const entries = Object.entries(params as Record<string, unknown>)
        .filter(([, value]) => value !== undefined)
        .map(([k, v]) => [k, normalizeForKey(v)] as const)
        .sort(([a], [b]) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
    return `${routeKey}${COMPOUND_KEY_DELIMITER}${JSON.stringify(entries)}`;
}

export default compoundParamsKey;
export {COMPOUND_KEY_DELIMITER, UNDEFINED_SENTINEL, normalizeForKey};
