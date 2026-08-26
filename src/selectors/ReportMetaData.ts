import {parsePendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';
import {getPendingDeleteMemberAccountIDs} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';
import arraysEqual from '@src/utils/arraysEqual';

import type {OnyxEntry} from 'react-native-onyx';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

// Preserves the distinction between a missing loading-state entry (undefined) and an entry whose
// `hasOnceLoadedReportActions` is not yet true, unlike the plain field selector above.
const reportActionsLoadingStateSelector = (loadingState: OnyxEntry<ReportLoadingState>): Pick<ReportLoadingState, 'hasOnceLoadedReportActions'> | undefined =>
    loadingState ? {hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions} : undefined;

const reportActionsListLoadingStateSelector = (
    loadingState: OnyxEntry<ReportLoadingState>,
): Pick<ReportLoadingState, 'hasOnceLoadedReportActions' | 'isLoadingInitialReportActions' | 'isLoadingOlderReportActions' | 'hasLoadingOlderReportActionsError'> | undefined =>
    loadingState
        ? {
              hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions,
              isLoadingInitialReportActions: loadingState.isLoadingInitialReportActions,
              isLoadingOlderReportActions: loadingState.isLoadingOlderReportActions,
              hasLoadingOlderReportActionsError: loadingState.hasLoadingOlderReportActionsError,
          }
        : undefined;

const isLoadingInitialReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingInitialReportActions;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

const pendingDeleteMemberAccountIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => getPendingDeleteMemberAccountIDs(reportMetadata?.pendingChatMembers);

type PendingNewTransactions = {
    /** Transaction ID mapped to the flag instance to sweep once highlighted, newest instance winning. */
    activeFlagKeys: Record<string, string>;
    /** Flag instances swept without highlighting, being stale, unreadable, or superseded by a newer instance. */
    expiredFlagKeys: string[];
};

/**
 * `useOnyx` drops an update when the selector's result shallow-compares equal, so a selector that allocates on every
 * run keeps every subscriber re-rendering. Classification still runs each time, since freshness depends on the clock;
 * only the identity is reused, and it changes as soon as the classification does.
 */
const lastPendingNewTransactions = new WeakMap<Record<string, true | null>, PendingNewTransactions>();

function samePendingNewTransactions(a: PendingNewTransactions, b: PendingNewTransactions): boolean {
    const activeIDs = Object.keys(a.activeFlagKeys);
    if (activeIDs.length !== Object.keys(b.activeFlagKeys).length || !arraysEqual(a.expiredFlagKeys, b.expiredFlagKeys)) {
        return false;
    }
    return activeIDs.every((transactionID) => a.activeFlagKeys[transactionID] === b.activeFlagKeys[transactionID]);
}

const pendingNewTransactionIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>): PendingNewTransactions | undefined => {
    const pendingNewTransactionIDs = reportMetadata?.pendingNewTransactionIDs;
    if (!pendingNewTransactionIDs) {
        return undefined;
    }
    const now = Date.now();
    const activeFlagKeys: Record<string, string> = {};
    const activeStamps: Record<string, number> = {};
    const expiredFlagKeys: string[] = [];
    for (const [flagKey, isFlagged] of Object.entries(pendingNewTransactionIDs)) {
        if (!isFlagged) {
            continue;
        }
        const flag = parsePendingNewTransactionFlagKey(flagKey);
        // An unreadable key is swept rather than highlighted, so it can never linger past its window.
        if (!flag) {
            expiredFlagKeys.push(flagKey);
            continue;
        }
        const {transactionID, flaggedAt} = flag;
        const age = now - flaggedAt;
        // A stamp ahead of the clock would never age out, so it is swept alongside the stale ones.
        if (age < 0 || age >= CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW) {
            expiredFlagKeys.push(flagKey);
            continue;
        }
        const previousFlagKey = activeFlagKeys[transactionID];
        if (previousFlagKey === undefined) {
            activeFlagKeys[transactionID] = flagKey;
            activeStamps[transactionID] = flaggedAt;
            continue;
        }
        const [newerFlagKey, olderFlagKey] = flaggedAt >= activeStamps[transactionID] ? [flagKey, previousFlagKey] : [previousFlagKey, flagKey];
        activeFlagKeys[transactionID] = newerFlagKey;
        activeStamps[transactionID] = Math.max(flaggedAt, activeStamps[transactionID]);
        expiredFlagKeys.push(olderFlagKey);
    }
    if (!Object.keys(activeFlagKeys).length && !expiredFlagKeys.length) {
        return undefined;
    }
    const classified: PendingNewTransactions = {activeFlagKeys, expiredFlagKeys};
    const previous = lastPendingNewTransactions.get(pendingNewTransactionIDs);
    if (previous && samePendingNewTransactions(previous, classified)) {
        return previous;
    }
    lastPendingNewTransactions.set(pendingNewTransactionIDs, classified);
    return classified;
};

const isOptimisticReportSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isOptimisticReport;

export {
    isActionLoadingSelector,
    hasOnceLoadedReportActionsSelector,
    reportActionsLoadingStateSelector,
    reportActionsListLoadingStateSelector,
    isLoadingInitialReportActionsSelector,
    isOptimisticReportSelector,
    pendingNewTransactionIDsSelector,
    pendingChatMembersSelector,
    pendingDeleteMemberAccountIDsSelector,
};
export type {PendingNewTransactions};
