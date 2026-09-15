import {getPendingDeleteMemberAccountIDs} from '@libs/ReportUtils';

import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

// Preserves the distinction between a missing loading-state entry (undefined) and an entry whose
// `hasOnceLoadedReportActions` is not yet true, unlike the plain field selector above.
// `isLoadingInitialReportActions` comes along so consumers can tell "a fetch is still in flight" apart from
// "a fetch already resolved without ever succeeding", which `hasOnceLoadedReportActions` alone cannot express.
const reportActionsLoadingStateSelector = (
    loadingState: OnyxEntry<ReportLoadingState>,
): Pick<ReportLoadingState, 'hasOnceLoadedReportActions' | 'isLoadingInitialReportActions'> | undefined =>
    loadingState ? {hasOnceLoadedReportActions: loadingState.hasOnceLoadedReportActions, isLoadingInitialReportActions: loadingState.isLoadingInitialReportActions} : undefined;

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
};
