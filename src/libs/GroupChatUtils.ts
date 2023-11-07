import {Report} from '@src/types/onyx';
import * as OptionsListUtils from './OptionsListUtils';
import * as ReportUtils from './ReportUtils';

/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(report: Report): string {
    const allPersonalDetails = ReportUtils.getAllPersonalDetails();
    const participants = report.participantAccountIDs ?? [];
    const isMultipleParticipantReport = participants.length > 1;
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, allPersonalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipantReport);
    return ReportUtils.getDisplayNamesStringFromTooltips(displayNamesWithTooltips);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getGroupChatName,
};
