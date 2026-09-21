import {getPendingDeleteMemberAccountIDs} from '@libs/ReportUtils';

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

const pendingNewTransactionIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.pendingNewTransactionIDs;

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
