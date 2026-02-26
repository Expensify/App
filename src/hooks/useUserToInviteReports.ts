import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {SearchOptionData} from '@libs/OptionsListUtils/types';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * For policy expense chat invitees, resolves the expense report and its associated chat report.
 */
export default function useUserToInviteReports(userToInvite: SearchOptionData | null | undefined) {
    const userToInviteReportID = userToInvite?.isPolicyExpenseChat ? userToInvite.reportID : undefined;
    const [userToInviteExpenseReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(userToInviteReportID)}`);
    const [userToInviteChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(userToInviteExpenseReport?.chatReportID)}`);

    return {userToInviteExpenseReport, userToInviteChatReport};
}
