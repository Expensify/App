import type {TransactionThreadNavigationDescriptor} from '@libs/TransactionThreadNavigationUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * When a single transaction report is displayed in RHP it may need extra context in case user navigated to it from MoneyRequestReportView or Reports
 * This context is the list of "sibling" transactions ids.
 * These "siblings" are transactions connected to the same parent Report that the original transaction.
 *
 * We save this value in onyx, so that we can correctly display navigation UI in transaction thread RHP.
 *
 * Optionally a map of transactionID -> sibling descriptor can be provided. It is used by snapshot-backed flows
 * (e.g. the Home "Recently added" section) where the sibling transactions are not guaranteed to live in the
 * main Onyx collections, so the prev/next navigation can't re-derive the thread report from them. When the map
 * is provided, navigation resolves (and lazily creates) each sibling's thread on demand from its descriptor.
 */

let lastSetIDs: string[] | null = null;
let lastSetSnapshotHash: number | null = null;
let lastSetDescriptors: Record<string, TransactionThreadNavigationDescriptor> | null = null;

function areDescriptorMapsEqual(a: Record<string, TransactionThreadNavigationDescriptor> | null, b: Record<string, TransactionThreadNavigationDescriptor> | null) {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    const aKeys = Object.keys(a);
    if (aKeys.length !== Object.keys(b).length) {
        return false;
    }
    // Compare the identity-bearing fields only; the transaction object is keyed by transactionID, so two
    // descriptors with the same reportID/childReportID/transactionID describe the same sibling.
    return aKeys.every((key) => {
        const next = b[key];
        return (
            !!next &&
            a[key].reportID === next.reportID &&
            a[key].reportAction?.childReportID === next.reportAction?.childReportID &&
            a[key].transaction?.transactionID === next.transaction?.transactionID
        );
    });
}

/**
 * Idempotent: skips the Onyx write when the IDs, snapshot hash, and descriptor map haven't changed.
 * This lets callers (e.g. useEffect in MoneyRequestReportTransactionList) fire
 * freely without worrying about referential equality of the input array.
 *
 * When the navigation list originates from a search, pass the search snapshot hash so the
 * transaction RHP carousel can fall back to snapshot data for transactions that aren't in the
 * live collection yet (e.g. an approver opening an expense from the Spend page).
 *
 * Snapshot-backed flows (e.g. Home "Recently added") can additionally pass a map of transactionID -> sibling
 * descriptor so the carousel resolves (and lazily creates) each sibling's thread on demand.
 */
function setActiveTransactionIDs(ids: string[], snapshotHash?: number, siblingDescriptorsByTransactionID?: Record<string, TransactionThreadNavigationDescriptor>) {
    const nextSnapshotHash = snapshotHash ?? null;
    const nextDescriptors = siblingDescriptorsByTransactionID ?? null;
    const areIDsUnchanged = lastSetIDs?.length === ids.length && lastSetIDs.every((id, i) => id === ids.at(i));
    if (areIDsUnchanged && lastSetSnapshotHash === nextSnapshotHash && areDescriptorMapsEqual(lastSetDescriptors, nextDescriptors)) {
        return Promise.resolve();
    }
    lastSetIDs = ids;
    lastSetSnapshotHash = nextSnapshotHash;
    lastSetDescriptors = nextDescriptors;
    return Promise.all([
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ids),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH, nextSnapshotHash),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS, nextDescriptors),
    ]);
}

/**
 * Returns the currently active transaction IDs and sibling descriptors. Used by screens that would otherwise
 * take over the carousel context (e.g. a money request report opened on top of an existing transaction thread)
 * so they can detect a snapshot-backed carousel (one with descriptors) and avoid clobbering it.
 */
function getActiveTransactionIDs(): {ids: string[] | null; descriptors: Record<string, TransactionThreadNavigationDescriptor> | null} {
    return {ids: lastSetIDs, descriptors: lastSetDescriptors};
}

function clearActiveTransactionIDs() {
    lastSetIDs = null;
    lastSetSnapshotHash = null;
    lastSetDescriptors = null;
    return Promise.all([
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, null),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH, null),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS, null),
    ]);
}

export {setActiveTransactionIDs, clearActiveTransactionIDs, getActiveTransactionIDs};
