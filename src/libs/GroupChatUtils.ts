import localeCompare from './LocaleCompare';
import * as ReportUtils from './ReportUtils';

/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(participantAccountIDs: number[]): string | undefined {
    const participants = participantAccountIDs ?? [];
    const isMultipleParticipantReport = participants.length > 1;

    return participants
        .map((participant) => ReportUtils.getDisplayNameForParticipant(participant, isMultipleParticipantReport))
        .sort((first, second) => localeCompare(first ?? '', second ?? ''))
        .filter(Boolean)
        .join(', ');
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getGroupChatName,
};
