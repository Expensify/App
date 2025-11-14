import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getPersonalDetailsForAccountIDs, isExpenseReport} from '@libs/OptionsListUtils';
import {getDisplayNamesWithTooltips, getParticipantsAccountIDs, isChatRoom, isPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useDisplayNamesWithTooltips(reportID: string) {
    const {localeCompare} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const participantAccountIDs = getParticipantsAccountIDs(report?.participants ?? {});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const participantPersonalDetailList = Object.values(getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails));
    const hasMultipleParticipants = participantPersonalDetailList.length > 1 || isChatRoom(report) || isPolicyExpenseChat(report) || isExpenseReport(report);

    return getDisplayNamesWithTooltips((participantPersonalDetailList || []).slice(0, 10), hasMultipleParticipants, localeCompare, undefined, isSelfDM(report));
}

export default useDisplayNamesWithTooltips;
