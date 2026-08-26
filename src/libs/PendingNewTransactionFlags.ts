/**
 * Builds, parses and clears the flags that mark newly added transactions for the report table's highlight. Each write
 * gets its own key, so clearing one is a blind merge of `null` and a re-flag lands where a late sweep cannot reach it.
 */

const FLAG_KEY_SEPARATOR = ':';

function buildPendingNewTransactionFlagKey(transactionID: string, flaggedAt: number): string {
    return `${transactionID}${FLAG_KEY_SEPARATOR}${flaggedAt}`;
}

/** Returns `undefined` for a key that isn't a `transactionID:flaggedAt` pair, which the caller sweeps rather than highlights. */
function parsePendingNewTransactionFlagKey(flagKey: string): {transactionID: string; flaggedAt: number} | undefined {
    const separatorIndex = flagKey.lastIndexOf(FLAG_KEY_SEPARATOR);
    if (separatorIndex === -1) {
        return undefined;
    }
    const flaggedAt = Number(flagKey.slice(separatorIndex + 1));
    if (!Number.isFinite(flaggedAt)) {
        return undefined;
    }
    return {transactionID: flagKey.slice(0, separatorIndex), flaggedAt};
}

/** `null` is the merge value that removes an entry outright rather than leaving a tombstone behind. */
function buildClearedPendingNewTransactionFlags(flagKeys: string[]): Record<string, null> {
    const clearedFlags: Record<string, null> = {};
    for (const flagKey of flagKeys) {
        clearedFlags[flagKey] = null;
    }
    return clearedFlags;
}

/** Stamped at write time, so each add carries its own instance. */
function buildPendingNewTransactionFlag(transactionID: string): Record<string, true> {
    return {[buildPendingNewTransactionFlagKey(transactionID, Date.now())]: true};
}

export {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlag, buildPendingNewTransactionFlagKey, parsePendingNewTransactionFlagKey};
