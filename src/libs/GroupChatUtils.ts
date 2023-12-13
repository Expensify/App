import Onyx, {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {PersonalDetails, Report} from '@src/types/onyx';
import * as OptionsListUtils from './OptionsListUtils';
import * as ReportUtils from './ReportUtils';

let allPersonalDetails: OnyxEntry<Record<string, PersonalDetails>> = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

/**
 * Returns the report name if the report is a group chat
 */
function getGroupChatName(report: Report): string | undefined {
    const participants = report.participantAccountIDs ?? [];
    const isMultipleParticipantReport = participants.length > 1;
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, allPersonalDetails ?? {});
    // @ts-expect-error Error will gone when OptionsListUtils will be migrated to Typescript
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipantReport);
    return ReportUtils.getDisplayNamesStringFromTooltips(displayNamesWithTooltips);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getGroupChatName,
};
