/** Keys for highlight flags. Each write gets its own `transactionID:flaggedAt` key, so a late sweep of an old flag cannot clear a newer one. */

const FLAG_KEY_SEPARATOR = ':';

function buildPendingNewTransactionFlagKey(transactionID: string, flaggedAt: number): string {
    return `${transactionID}${FLAG_KEY_SEPARATOR}${flaggedAt}`;
}

/** `undefined` for a malformed key, which callers sweep rather than highlight. */
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

/** `null` removes the entry in a merge instead of leaving a tombstone. */
function buildClearedPendingNewTransactionFlags(flagKeys: string[]): Record<string, null> {
    const clearedFlags: Record<string, null> = {};
    for (const flagKey of flagKeys) {
        clearedFlags[flagKey] = null;
    }
    return clearedFlags;
}

function buildPendingNewTransactionFlag(transactionID: string): Record<string, true> {
    return {[buildPendingNewTransactionFlagKey(transactionID, Date.now())]: true};
}

export {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlag, buildPendingNewTransactionFlagKey, parsePendingNewTransactionFlagKey};
