import type {OnyxEntry} from 'react-native-onyx';
import {getChatByParticipants} from '@libs/ReportUtils';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

type ResolveChatForSubmitCleanupParams = {
    participant: Participant;
    currentUserAccountID: number;
    report: OnyxEntry<Report>;
    fallbackOptimisticChatReportID: string;
};

type ResolveChatForSubmitCleanupResult = {
    report: OnyxEntry<Report>;
    optimisticChatReportID: string;
};

/** Mirrors the action's chat priority (policyExpenseChat → 1:1 DM → fallback) so cleanup targets the actual submission report when the participant changed after opening confirmation. */
function resolveChatForSubmitCleanup({participant, currentUserAccountID, report, fallbackOptimisticChatReportID}: ResolveChatForSubmitCleanupParams): ResolveChatForSubmitCleanupResult {
    let resolvedChatReportID: string | undefined;
    if (participant.isPolicyExpenseChat && participant.reportID) {
        resolvedChatReportID = participant.reportID;
    } else if (participant.accountID) {
        resolvedChatReportID = getChatByParticipants([participant.accountID, currentUserAccountID])?.reportID;
    }
    const participantDiffersFromReport = !!resolvedChatReportID && resolvedChatReportID !== report?.reportID;
    return {
        report: participantDiffersFromReport ? undefined : report,
        optimisticChatReportID: resolvedChatReportID ?? fallbackOptimisticChatReportID,
    };
}

export default resolveChatForSubmitCleanup;
