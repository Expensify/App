import {parsePendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';
import {getPendingDeleteMemberAccountIDs} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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

const pendingDeleteMemberAccountIDsByReportIDSelector = (reportMetadata: OnyxCollection<ReportMetadata>): Record<string, string[]> => {
    const result: Record<string, string[]> = {};

    for (const [key, metadata] of Object.entries(reportMetadata ?? {})) {
        // Reports with no pending members at all are the overwhelming majority, so skip them before doing any work.
        if (!metadata?.pendingChatMembers?.length) {
            continue;
        }

        const pendingDeleteMemberAccountIDs = getPendingDeleteMemberAccountIDs(metadata.pendingChatMembers);
        if (pendingDeleteMemberAccountIDs.length === 0) {
            continue;
        }

        result[key.replace(ONYXKEYS.COLLECTION.REPORT_METADATA, '')] = pendingDeleteMemberAccountIDs;
    }

    return result;
};

type PendingNewTransactions = {
    /** Transaction ID to the flag to sweep once shown. The newest flag wins. */
    activeFlagKeys: Record<string, string>;
    /** Flags to sweep without showing: stale, unreadable or superseded. */
    expiredFlagKeys: string[];
};

/** Freshness is checked when the selector runs, not on a timer, so a flag can expire while its consumer waits to show it. */
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
        if (!flag) {
            expiredFlagKeys.push(flagKey);
            continue;
        }
        const {transactionID, flaggedAt} = flag;
        const age = now - flaggedAt;
        // A stamp ahead of the clock would never age out.
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
    return {activeFlagKeys, expiredFlagKeys};
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
    pendingDeleteMemberAccountIDsByReportIDSelector,
};
export type {PendingNewTransactions};
