import CONST from '@src/CONST';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

// Preserves the distinction between a missing loading-state entry (undefined) and an entry whose
// `hasOnceLoadedReportActions` is not yet true, unlike the plain field selector above.
const reportActionsLoadingStateSelector = (loadingState: OnyxEntry<ReportLoadingState>): Pick<ReportLoadingState, 'hasOnceLoadedReportActions'> | undefined =>
    loadingState ? {hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions} : undefined;

const isLoadingInitialReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingInitialReportActions;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

type PendingNewTransactions = {
    activeIDs: Record<string, true>;
    expiredIDs: string[];
};

const pendingNewTransactionIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>): PendingNewTransactions | undefined => {
    const pendingNewTransactionIDs = reportMetadata?.pendingNewTransactionIDs;
    if (!pendingNewTransactionIDs) {
        return undefined;
    }
    const now = Date.now();
    const activeIDs: Record<string, true> = {};
    const expiredIDs: string[] = [];
    for (const [transactionID, flaggedAt] of Object.entries(pendingNewTransactionIDs)) {
        if (flaggedAt == null) {
            continue;
        }
        if (typeof flaggedAt === 'number' && now - flaggedAt < CONST.PENDING_TRANSACTION_FRESHNESS_WINDOW) {
            activeIDs[transactionID] = true;
        } else {
            expiredIDs.push(transactionID);
        }
    }
    if (!Object.keys(activeIDs).length && !expiredIDs.length) {
        return undefined;
    }
    return {activeIDs, expiredIDs};
};

const isOptimisticReportSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isOptimisticReport;

export {
    isActionLoadingSelector,
    hasOnceLoadedReportActionsSelector,
    reportActionsLoadingStateSelector,
    isLoadingInitialReportActionsSelector,
    isOptimisticReportSelector,
    pendingNewTransactionIDsSelector,
    pendingChatMembersSelector,
};
export type {PendingNewTransactions};
