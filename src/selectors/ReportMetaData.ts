import type {OnyxEntry} from 'react-native-onyx';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

const isActionLoadingSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.hasOnceLoadedReportActions;

const isLoadingInitialReportActionsSelector = (loadingState: OnyxEntry<ReportLoadingState>) => loadingState?.isLoadingInitialReportActions;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

export {isActionLoadingSelector, hasOnceLoadedReportActionsSelector, isLoadingInitialReportActionsSelector, pendingChatMembersSelector};
