import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useReportTransactions from '@hooks/useReportTransactions';
import {getIOUReportIDFromReportActionPreview, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isClosedExpenseReportWithNoExpenses} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Transaction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';
import {useReportActionActiveEdit} from './ReportActionEditMessageContext';

type ReportActionItemProps = PureReportActionItemProps & {
    /** Draft message for the report action */
    draftMessage?: string;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

function ReportActionItem({action, report, draftMessage: draftMessageProp, personalDetails, linkedTransactionRouteError: linkedTransactionRouteErrorProp, ...props}: ReportActionItemProps) {
    const reportID = report?.reportID;
    const originalReportID = useOriginalReportID(reportID, action);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getIOUReportIDFromReportActionPreview(action)}`);

    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const transactionsOnIOUReport = useReportTransactions(iouReport?.reportID);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;

    const getLinkedTransactionRouteError = useCallback(
        (transaction: OnyxEntry<Transaction>) => {
            return linkedTransactionRouteErrorProp ?? transaction?.errorFields?.route;
        },
        [linkedTransactionRouteErrorProp],
    );

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector: getLinkedTransactionRouteError});

    const {editingMessage, editingReportAction} = useReportActionActiveEdit();
    const draftMessageFromEditingContext = editingReportAction && action && editingReportAction.reportActionID === action.reportActionID ? (editingMessage ?? undefined) : undefined;
    const draftMessage = draftMessageProp ?? draftMessageFromEditingContext;

    return (
        <PureReportActionItem
            {...props}
            action={action}
            report={report}
            draftMessage={draftMessage}
            iouReport={iouReport}
            linkedTransactionRouteError={linkedTransactionRouteError}
            personalDetails={personalDetails}
            originalReportID={originalReportID}
            originalReport={originalReport}
            isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses(iouReport, transactionsOnIOUReport)}
            isTrackIntentUser={isTrackIntentUser}
        />
    );
}

export default ReportActionItem;
