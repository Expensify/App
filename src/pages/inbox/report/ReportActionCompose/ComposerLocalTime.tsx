import {personalDetailByAccountIDSelector} from '@selectors/PersonalDetails';
import React from 'react';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import {getReportOfflinePendingActionAndErrors, getReportRecipientAccountIDs} from '@libs/ReportUtils';
import {isAgentEmail} from '@libs/SessionUtils';
import ParticipantLocalTime from '@pages/inbox/report/ParticipantLocalTime';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useComposerState} from './ComposerContext';

function ComposerLocalTime() {
    const {reportID} = useComposerState();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    const shouldShow = canShowRecipientLocalTime && !isComposerFullSize;
    const reportRecipientAccountID = getReportRecipientAccountIDs(report, currentUserAccountID).at(0);
    const [reportRecipient] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailByAccountIDSelector(shouldShow ? reportRecipientAccountID : undefined)});

    if (!shouldShow || isEmptyObject(reportRecipient) || isAgentEmail(reportRecipient?.login)) {
        return null;
    }

    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <ParticipantLocalTime participant={reportRecipient} />
        </OfflineWithFeedback>
    );
}

export default ComposerLocalTime;
