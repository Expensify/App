import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import useSidePanelReportID from '@hooks/useSidePanelReportID';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {addComment} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Returns a callback that opens the side panel (or Concierge chat on native)
 * and sends the provided search query as a message.
 */
function useAskConcierge() {
    const sidePanelReportID = useSidePanelReportID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {openConciergeAnywhere, isInSidePanel} = useOpenConciergeAnywhere();
    const targetReportID = (isInSidePanel ? sidePanelReportID : undefined) ?? conciergeReportID;
    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetReportID)}`);
    const {timezone, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();

    return (searchQuery: string) => {
        openConciergeAnywhere();
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery || !targetReport || !targetReportID) {
            return;
        }
        addComment({
            report: targetReport,
            notifyReportID: targetReportID,
            ancestors: [],
            text: trimmedQuery,
            timezoneParam: timezone ?? CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID,
            shouldPlaySound: true,
            isInSidePanel,
            delegateAccountID,
        });
    };
}

export default useAskConcierge;
