import React from 'react';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {canShowReportRecipientLocalTime, getReportOfflinePendingActionAndErrors, getReportRecipientAccountIDs} from '@libs/ReportUtils';
import ParticipantLocalTime from '@pages/inbox/report/ParticipantLocalTime';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ComposerLocalTimeProps = {
    reportID: string;
};

function ComposerLocalTime({reportID}: ComposerLocalTimeProps) {
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    const shouldShow = canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;
    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails?.[reportRecipientAccountIDs[0]];

    if (!shouldShow || isEmptyObject(reportRecipient)) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <ParticipantLocalTime participant={reportRecipient} />
        </OfflineWithFeedback>
    );
}

export default ComposerLocalTime;
