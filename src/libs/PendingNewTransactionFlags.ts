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

export {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlagKey, parsePendingNewTransactionFlagKey};
