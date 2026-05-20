import type {OnyxEntry} from 'react-native-onyx';
import {getChatByParticipants, getReportOrDraftReport, isDeprecatedGroupDM, isGroupChat, isMoneyRequestReport, isPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type ResolveChatForSubmitCleanupParams = {
    participant: Participant;
    currentUserAccountID: number;
    report: OnyxEntry<Report>;
    fallbackOptimisticChatReportID: string;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
};

type ResolveChatForSubmitCleanupResult = {
    report: OnyxEntry<Report>;
    optimisticChatReportID: string;
};

/** Mirrors the action's chat resolution: keep the source report when the action would, else resolve via policyExpenseChat → 1:1 DM → optimistic fallback. */
function resolveChatForSubmitCleanup({
    participant,
    currentUserAccountID,
    report,
    fallbackOptimisticChatReportID,
    action,
}: ResolveChatForSubmitCleanupParams): ResolveChatForSubmitCleanupResult {
    if (isMoneyRequestReport(report)) {
        return {report, optimisticChatReportID: fallbackOptimisticChatReportID};
    }

    // SUBMIT (move-from-track) writes to the participant's policy/1:1 chat, never the self-DM source — skip the keep-source shortcut.
    const isMoveFromTrackSubmit = action === CONST.IOU.ACTION.SUBMIT;

    // Keep `report` unless it's a non-special 1:1 chat whose participants don't match the submission target.
    if (!isMoveFromTrackSubmit && report?.reportID) {
        const isSpecialChat = !!participant.isPolicyExpenseChat || isPolicyExpenseChat(report) || isSelfDM(report) || isGroupChat(report) || isDeprecatedGroupDM(report);
        if (isSpecialChat) {
            return {report, optimisticChatReportID: fallbackOptimisticChatReportID};
        }
        if (participant.accountID) {
            const reportParticipants = Object.keys(report.participants ?? {})
                .map(Number)
                .sort();
            const expected = [participant.accountID, currentUserAccountID].sort();
            const participantsMatch = expected.length === reportParticipants.length && expected.every((id, i) => id === reportParticipants.at(i));
            if (participantsMatch) {
                return {report, optimisticChatReportID: fallbackOptimisticChatReportID};
            }
        }
    }

    let chatReportID: string | undefined;
    if (participant.isPolicyExpenseChat && participant.reportID && getReportOrDraftReport(participant.reportID)) {
        chatReportID = participant.reportID;
    } else if (participant.accountID) {
        chatReportID = getChatByParticipants([participant.accountID, currentUserAccountID])?.reportID;
    }

    return {report: undefined, optimisticChatReportID: chatReportID ?? fallbackOptimisticChatReportID};
}

export default resolveChatForSubmitCleanup;
