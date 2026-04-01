import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {canShowReportRecipientLocalTime, getReportRecipientAccountIDs} from '@libs/ReportUtils';
import ParticipantLocalTime from '@pages/inbox/report/ParticipantLocalTime';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// Outer guard: cheap selector — only participant count and chatType.
// Returns true only for likely 1:1 DMs (no chatType, at most 2 participants).
function useLooksLikeDM(reportID: string): boolean {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        selector: (r: OnyxEntry<{participants?: Record<string, unknown>; chatType?: string}>) => ({
            participantCount: Object.keys(r?.participants ?? {}).length,
            chatType: r?.chatType,
        }),
    });
    return (report?.participantCount ?? 0) <= 2 && !report?.chatType;
}

type ComposerLocalTimeProps = {
    reportID: string;
    pendingAction: PendingAction | undefined;
    isComposerFullSize: boolean;
};

function ComposerLocalTimeInner({reportID, pendingAction, isComposerFullSize}: ComposerLocalTimeProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const {isOffline} = useNetwork();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const shouldShowReportRecipientLocalTime = canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize;

    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails?.[reportRecipientAccountIDs[0]];
    const hasReportRecipient = !isEmptyObject(reportRecipient);

    if (!shouldShowReportRecipientLocalTime || !hasReportRecipient || isOffline) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <ParticipantLocalTime participant={reportRecipient} />
        </OfflineWithFeedback>
    );
}

function ComposerLocalTime({reportID, pendingAction, isComposerFullSize}: ComposerLocalTimeProps) {
    const looksLikeDM = useLooksLikeDM(reportID);

    if (!looksLikeDM) {
        return null;
    }

    return (
        <ComposerLocalTimeInner
            reportID={reportID}
            pendingAction={pendingAction}
            isComposerFullSize={isComposerFullSize}
        />
    );
}

export default ComposerLocalTime;
