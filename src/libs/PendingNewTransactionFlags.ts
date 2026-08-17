/**
 * Builds, parses and clears the flags that mark newly added transactions for the report table's highlight, keyed per write
 * so one write can be cleared without touching another for the same transaction.
 */

const FLAG_KEY_SEPARATOR = ':';

/** Keying flags by instance means clearing one is a plain merge of `null`, and a re-flag lands under a key a late sweep can't reach. */
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

/** Maps each flag key to `null`, the merge value that removes the entry outright. */
function buildClearedPendingNewTransactionFlags(flagKeys: string[]): Record<string, null> {
    const clearedFlags: Record<string, null> = {};
    for (const flagKey of flagKeys) {
        clearedFlags[flagKey] = null;
    }
    return clearedFlags;
}

/** Builds the flag entry for one add, stamped at write time so each write is its own instance. */
function buildPendingNewTransactionFlag(transactionID: string): Record<string, true> {
    return {[buildPendingNewTransactionFlagKey(transactionID, Date.now())]: true};
}

export {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlag, buildPendingNewTransactionFlagKey, parsePendingNewTransactionFlagKey};
