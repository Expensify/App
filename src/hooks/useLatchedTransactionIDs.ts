import {useState} from 'react';

/**
 * Snapshots the first non-empty transaction-ID set so layout decisions driven by
 * `transactions.length` stay stable across optimistic additions (e.g. Duplicate). Pass `resetKey`
 * (typically the report ID) to re-snapshot when the component is reused for a different report
 * via setParams without remount.
 */
function useLatchedTransactionIDs(transactionIDs: ReadonlyArray<string> | undefined, resetKey?: string): Set<string> | undefined {
    const [latched, setLatched] = useState<{key: string | undefined; ids: Set<string>} | undefined>(undefined);
    const isEmpty = !transactionIDs || transactionIDs.length === 0;
    const keyChanged = latched !== undefined && latched.key !== resetKey;
    if (!isEmpty && (latched === undefined || keyChanged)) {
        setLatched({key: resetKey, ids: new Set(transactionIDs)});
    }
    return latched?.ids;
}

export default useLatchedTransactionIDs;
