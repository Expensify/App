import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';
import localeCompare from './LocaleCompare';
import type {OptionData} from './ReportUtils';
import * as ReportUtils from './ReportUtils';

/**
 * Returns the group chat name for confirm page
 */
function getGroupChatConfirmName(participants: OptionData[]): string | undefined {
    const isMultipleParticipantReport = participants.length > 1;

    return participants
        .map((participant) => ReportUtils.getDisplayNameForParticipant(participant.accountID!, isMultipleParticipantReport))
        .sort((first, second) => localeCompare(first ?? '', second ?? ''))
        .filter(Boolean)
        .join(', ');
}

/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(report: OnyxEntry<Report>): string | undefined {
    const participants = report?.participantAccountIDs ?? [];
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
    getGroupChatConfirmName,
};
