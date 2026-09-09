import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';
import useOpenConciergeAnywhere from '@hooks/useOpenConciergeAnywhere';
import useSidePanelReportID from '@hooks/useSidePanelReportID';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {addAttachmentWithComment, addComment} from '@userActions/Report';
import {createTaskFromMarkdown} from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

/**
 * Returns a callback that opens the side panel (or Concierge chat on native)
 * and sends the provided search query as a message.
 * Also returns a flag indicating whether the Ask Concierge item is ready to be displayed.
 *
 * @param forceConcierge Always target the Concierge report, ignoring the report the side panel currently maps to.
 */
function useAskConcierge({forceConcierge = false}: {forceConcierge?: boolean} = {}) {
    const sidePanelReportID = useSidePanelReportID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {openConciergeAnywhere, isInSidePanel} = useOpenConciergeAnywhere();
    const targetReportID = !forceConcierge && isInSidePanel && sidePanelReportID ? sidePanelReportID : conciergeReportID;
    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(targetReportID)}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {timezone, accountID: currentUserAccountID} = currentUserPersonalDetails;
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const delegateAccountID = useDelegateAccountID();
    const shouldShowAskConcierge = !!targetReportID && !!targetReport;

    const askConcierge = (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery || !shouldShowAskConcierge) {
            return;
        }
        openConciergeAnywhere({forceConcierge});

        if (createTaskFromMarkdown({text: trimmedQuery, parentReport: targetReport, currentUserPersonalDetails, quickAction, delegateAccountID})) {
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
            conciergeReportID,
        });
    };

    const askConciergeWithAttachment = (attachments: FileObject | FileObject[], searchQuery: string) => {
        if (!shouldShowAskConcierge) {
            return;
        }
        openConciergeAnywhere({forceConcierge});
        addAttachmentWithComment({
            report: targetReport,
            notifyReportID: targetReportID,
            ancestors: [],
            attachments,
            currentUserAccountID,
            text: searchQuery.trim(),
            timezone: timezone ?? CONST.DEFAULT_TIME_ZONE,
            shouldPlaySound: true,
            isInSidePanel,
            delegateAccountID,
            conciergeReportID,
        });
    };

    return {askConcierge, askConciergeWithAttachment, shouldShowAskConcierge, conciergeTargetReportID: targetReportID};
}

export default useAskConcierge;
