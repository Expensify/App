import type {OnyxEntry} from 'react-native-onyx';
import type {ReportMetadata} from '@src/types/onyx';

const isActionLoadingSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.isActionLoading ?? false;

const hasOnceLoadedReportActionsSelector = (reportMetadata: OnyxEntry<ReportMetadata>) => reportMetadata?.hasOnceLoadedReportActions;

const pendingChatMembersSelector = (reportMetadata: OnyxEntry<ReportMetadata>): OnyxEntry<ReportMetadata> =>
    reportMetadata ? {pendingChatMembers: reportMetadata.pendingChatMembers} : undefined;

export {isActionLoadingSelector, hasOnceLoadedReportActionsSelector, pendingChatMembersSelector};
