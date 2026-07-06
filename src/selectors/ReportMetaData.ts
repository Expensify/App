import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

const isLoadingInitialReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingInitialReportActions;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

const pendingChatMembersListSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.pendingChatMembers;

const pendingNewTransactionIDsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.pendingNewTransactionIDs;

export {
    isActionLoadingSelector,
    hasOnceLoadedReportActionsSelector,
    isLoadingInitialReportActionsSelector,
    pendingNewTransactionIDsSelector,
    pendingChatMembersSelector,
    pendingChatMembersListSelector,
};
