import React from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {canShowReportRecipientLocalTime, getReportOfflinePendingActionAndErrors, getReportRecipientAccountIDs} from '@libs/ReportUtils';
import ParticipantLocalTime from '@pages/inbox/report/ParticipantLocalTime';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useComposerState} from './ComposerContext';

type ComposerLocalTimeProps = {
    reportID: string;
};

function ComposerLocalTime({reportID}: ComposerLocalTimeProps) {
    const {isComposerFullSize} = useComposerState();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const {isOffline} = useNetwork();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    const shouldShow = canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;
    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails?.[reportRecipientAccountIDs[0]];

    if (!shouldShow || isEmptyObject(reportRecipient) || isOffline) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <ParticipantLocalTime participant={reportRecipient} />
        </OfflineWithFeedback>
    );
}

export default ComposerLocalTime;
