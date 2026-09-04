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
 *
 * The carousel is a single global value written by several different screens (the Spend page's flat expense
 * list, a report's own transaction list, the Home "Recently added" widget, duplicate review). To keep those
 * writers from clobbering each other, every writer stamps the list with a `source` that identifies it, and
 * only ever refreshes or clears a carousel it still owns. Ownership lives in module state rather than Onyx
 * because it only ever arbitrates writes within a single JS session.
 */

/**
 * Identities for the screens that can seed the carousel. Every writer stamps its list with one of these so it
 * can later refresh or clear only a carousel it still owns.
 */
const CAROUSEL_SOURCE = {
    /** A report's own transaction list */
    report: (reportID: string | undefined) => `report:${reportID}`,

    /**
     * A row pressed inside a report's transaction list. Distinct from `report` so that the list tearing down
     * behind the opened expense doesn't clear the carousel it just handed to that expense.
     */
    reportRow: (reportID: string | undefined) => `reportRow:${reportID}`,

    /** A search results list (the Spend page and its grouped variants) */
    search: (hash: number | undefined) => `search:${hash}`,

    /** The Home "Recently added" widget */
    homeRecentlyAdded: 'home:recentlyAdded',

    /** The Home "Review X expenses" row */
    homeReviewFlagged: 'home:reviewFlagged',

    /** The duplicate-review flow */
    duplicateReview: (transactionID: string | undefined) => `duplicateReview:${transactionID}`,
} as const;

let lastSetIDs: string[] | null = null;
let lastSetSource: string | null = null;
let lastSetSnapshotHash: number | null = null;
let lastSetDescriptors: Record<string, TransactionThreadNavigationDescriptor> | null = null;

type SetActiveTransactionIDsOptions = {
    /**
     * Stable identity of the screen that owns this carousel, e.g. `search:<hash>` or `report:<reportID>`.
     * Writers pass their own source so they can later refresh or clear the carousel only while they still own it.
     */
    source?: string;

    /**
     * Hash of the search snapshot backing these IDs. The carousel falls back to that snapshot when a sibling
     * hasn't landed in the live Onyx collections yet.
     */
    snapshotHash?: number;

    /** Optional map of transactionID -> sibling descriptor for snapshot-backed flows. */
    descriptors?: Record<string, TransactionThreadNavigationDescriptor>;
};

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

function areIDListsEqual(a: string[] | null, b: string[]) {
    return a?.length === b.length && a.every((id, index) => id === b.at(index));
}

/**
 * Idempotent: skips the Onyx write when the IDs, source, snapshot hash, and descriptor map haven't changed.
 * This lets callers (e.g. useEffect in MoneyRequestReportTransactionList) fire
 * freely without worrying about referential equality of the input array.
 */
function setActiveTransactionIDs(ids: string[], {source, snapshotHash, descriptors}: SetActiveTransactionIDsOptions = {}) {
    const nextSource = source ?? null;
    const nextSnapshotHash = snapshotHash ?? null;
    const nextDescriptors = descriptors ?? null;
    if (areIDListsEqual(lastSetIDs, ids) && lastSetSource === nextSource && lastSetSnapshotHash === nextSnapshotHash && areDescriptorMapsEqual(lastSetDescriptors, nextDescriptors)) {
        return Promise.resolve();
    }
    lastSetIDs = ids;
    lastSetSource = nextSource;
    lastSetSnapshotHash = nextSnapshotHash;
    lastSetDescriptors = nextDescriptors;
    return Promise.all([
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, ids),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH, nextSnapshotHash),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS, nextDescriptors),
    ]);
}

/**
 * Returns the currently active transaction IDs, their owner, and sibling descriptors. Used by screens that would
 * otherwise take over the carousel context (e.g. a money request report opened on top of an existing transaction
 * thread) so they can detect a snapshot-backed carousel (one with descriptors) and avoid clobbering it.
 */
function getActiveTransactionIDs(): {ids: string[] | null; descriptors: Record<string, TransactionThreadNavigationDescriptor> | null; source: string | null} {
    return {ids: lastSetIDs, descriptors: lastSetDescriptors, source: lastSetSource};
}

/**
 * Whether a writer that stays mounted behind the RHP (e.g. the Spend page's list under an open expense) should
 * push a refreshed list into the carousel.
 *
 * It may only do so when it still owns the carousel, or when nothing owns it yet. Once the user drills into a
 * screen that seeds its own carousel — a report's transaction list, say — that screen becomes the owner and the
 * background list must leave it alone until the user comes back out to it.
 */
function shouldRefreshActiveTransactionIDs(source: string, ids: string[]): boolean {
    if (ids.length < 2) {
        return false;
    }
    if (!lastSetIDs?.length) {
        return true;
    }
    if (lastSetSource !== source) {
        return false;
    }
    return !areIDListsEqual(lastSetIDs, ids);
}

function clearActiveTransactionIDs() {
    lastSetIDs = null;
    lastSetSource = null;
    lastSetSnapshotHash = null;
    lastSetDescriptors = null;
    return Promise.all([
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, null),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH, null),
        Onyx.set(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS, null),
    ]);
}

/**
 * Clears the carousel only when `source` still owns it.
 *
 * A writer that unmounts must not wipe a carousel another screen has since taken over — that is how the arrows
 * used to vanish when a screen re-seeded the list while the previous owner was tearing down.
 */
function clearActiveTransactionIDsForSource(source: string) {
    if (lastSetSource !== source) {
        return Promise.resolve();
    }
    return clearActiveTransactionIDs();
}

export {setActiveTransactionIDs, clearActiveTransactionIDs, clearActiveTransactionIDsForSource, getActiveTransactionIDs, shouldRefreshActiveTransactionIDs, CAROUSEL_SOURCE};
export type {SetActiveTransactionIDsOptions};
