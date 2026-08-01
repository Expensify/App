import CONST from '@src/CONST';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';
import type {PendingNewTransactionFlag} from '@src/types/onyx/ReportMetadata';

import type {OnyxEntry} from 'react-native-onyx';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

// Preserves the distinction between a missing loading-state entry (undefined) and an entry whose
// `hasOnceLoadedReportActions` is not yet true, unlike the plain field selector above.
const reportActionsLoadingStateSelector = (loadingState: OnyxEntry<ReportLoadingState>): Pick<ReportLoadingState, 'hasOnceLoadedReportActions'> | undefined =>
    loadingState ? {hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions} : undefined;

const reportActionsListLoadingStateSelector = (
    loadingState: OnyxEntry<ReportLoadingState>,
): Pick<ReportLoadingState, 'hasOnceLoadedReportActions' | 'isLoadingInitialReportActions'> | undefined =>
    loadingState
        ? {
              hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions,
              isLoadingInitialReportActions: loadingState.isLoadingInitialReportActions,
          }
        : undefined;

const isLoadingInitialReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingInitialReportActions;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

// Flags keep the stamp they were written with, so a sweep can tell the instance it saw from a later one.
type PendingNewTransactions = {
    activeFlags: Record<string, PendingNewTransactionFlag>;
    expiredFlags: Record<string, PendingNewTransactionFlag>;
};

const pendingNewTransactionIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>): PendingNewTransactions | undefined => {
    const pendingNewTransactionIDs = reportMetadata?.pendingNewTransactionIDs;
    if (!pendingNewTransactionIDs) {
        return undefined;
    }
    const now = Date.now();
    const activeFlags: Record<string, PendingNewTransactionFlag> = {};
    const expiredFlags: Record<string, PendingNewTransactionFlag> = {};
    for (const [transactionID, flaggedAt] of Object.entries(pendingNewTransactionIDs)) {
        if (flaggedAt == null) {
            continue;
        }
        // Legacy `true` flags predate the timestamp scheme and persisted until consumed, so they never expire.
        if (flaggedAt === true || now - flaggedAt < CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW) {
            activeFlags[transactionID] = flaggedAt;
        } else {
            expiredFlags[transactionID] = flaggedAt;
        }
    }
    if (!Object.keys(activeFlags).length && !Object.keys(expiredFlags).length) {
        return undefined;
    }
    return {activeFlags, expiredFlags};
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
};
export type {PendingNewTransactions};
