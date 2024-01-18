import type {Report} from '@src/types/onyx';
import * as ReportUtils from './ReportUtils';

/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(report: Report): string | undefined {
    const participants = report.participantAccountIDs ?? [];
    const isMultipleParticipantReport = participants.length > 1;

    return participants
        .map((participant) => ReportUtils.getDisplayNameForParticipant(participant, isMultipleParticipantReport))
        .sort((first, second) => first?.localeCompare(second ?? '') ?? 0)
        .filter(Boolean)
        .join(', ');
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getGroupChatName,
};
