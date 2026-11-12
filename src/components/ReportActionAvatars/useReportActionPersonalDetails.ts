import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDelegateAccountIDFromReportAction, getHumanAgentAccountIDFromReportAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {parentActionAccountIDsSelector} from '@src/selectors/ReportAction';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

// getIcons reads parent actions from the live store, not the search snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

type UseReportActionPersonalDetailsParams = {
    /** The report action whose avatar is shown */
    action: OnyxEntry<ReportAction>;

    /** The chat the action sits in */
    chatReport: OnyxEntry<Report>;

    /** The money request or invoice report the action belongs to, if any */
    iouReport: OnyxEntry<Report>;

    /** The chat report of the report passed to the avatar hook */
    reportChatReport: OnyxEntry<Report>;

    /** The account that processed a bill pay, if any */
    billProcessorAccountID: number | undefined;

    /** The one account every expense on the previewed report comes from, if there is one */
    reportPreviewSenderID: number | undefined;

    /** Other accounts the caller looks up */
    extraAccountIDs?: Array<number | undefined>;
};

/**
 * Subscribes to the personal details of every account a report action's avatars, names and getIcons can look up, so the row skips writes to anyone else.
 */
function useReportActionPersonalDetails({
    action,
    chatReport,
    iouReport,
    reportChatReport,
    billProcessorAccountID,
    reportPreviewSenderID,
    extraAccountIDs = [],
}: UseReportActionPersonalDetailsParams) {
    const [chatReportParentActionAccountIDs] = useOnyxWithoutSnapshots(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(chatReport?.parentReportID)}`, {
        selector: parentActionAccountIDsSelector(chatReport?.parentReportActionID),
    });
    const [iouReportParentActionAccountIDs] = useOnyxWithoutSnapshots(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(iouReport?.parentReportID)}`, {
        selector: parentActionAccountIDsSelector(iouReport?.parentReportActionID),
    });

    return usePersonalDetailsByIDs([
        ...extraAccountIDs,
        action?.actorAccountID,
        action?.adminAccountID,
        action?.childOwnerAccountID,
        action?.childManagerAccountID,
        getDelegateAccountIDFromReportAction(action),
        getHumanAgentAccountIDFromReportAction(action),
        billProcessorAccountID,
        reportPreviewSenderID,
        CONST.ACCOUNT_ID.CONCIERGE,
        CONST.ACCOUNT_ID.NOTIFICATIONS,
        ...[chatReport, iouReport, reportChatReport].flatMap((participantsReport) => [
            participantsReport?.ownerAccountID,
            participantsReport?.managerID,
            participantsReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL ? participantsReport.invoiceReceiver.accountID : undefined,
            ...Object.keys(participantsReport?.participants ?? {}).map(Number),
        ]),
        ...(chatReportParentActionAccountIDs ?? []),
        ...(iouReportParentActionAccountIDs ?? []),
    ]);
}

export default useReportActionPersonalDetails;
