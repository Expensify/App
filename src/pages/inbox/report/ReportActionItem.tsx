import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import {getIOUReportIDFromReportActionPreview, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {chatIncludesChronosWithID, getTransactionsWithReceipts, isArchivedNonExpenseReport, isClosedExpenseReportWithNoExpenses} from '@libs/ReportUtils';
import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {deleteReportActionDraft, resolveActionableMentionWhisper, resolveActionableReportMentionWhisper} from '@userActions/Report';
import {clearError} from '@userActions/Transaction';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Transaction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';

type ReportActionItemProps = PureReportActionItemProps & {
    /** Whether to show the draft message or not */
    shouldShowDraftMessage?: boolean;

    /** Draft message for the report action */
    draftMessage?: string;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** User billing fund ID */
    userBillingFundID: number | undefined;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed?: boolean;
};

function ReportActionItem({
    action,
    report,
    draftMessage,
    personalDetails,
    userBillingFundID,
    linkedTransactionRouteError: linkedTransactionRouteErrorProp,
    isTryNewDotNVPDismissed,
    ...props
}: ReportActionItemProps) {
    const reportID = report?.reportID;
    const originalReportID = useOriginalReportID(reportID, action);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getIOUReportIDFromReportActionPreview(action)}`);

    const transactionsOnIOUReport = useReportTransactions(iouReport?.reportID);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;

    const getLinkedTransactionRouteError = useCallback(
        (transaction: OnyxEntry<Transaction>) => {
            return linkedTransactionRouteErrorProp ?? transaction?.errorFields?.route;
        },
        [linkedTransactionRouteErrorProp],
    );

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector: getLinkedTransactionRouteError});

    return (
        <PureReportActionItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            action={action}
            report={report}
            draftMessage={draftMessage}
            iouReport={iouReport}
            linkedTransactionRouteError={linkedTransactionRouteError}
            personalDetails={personalDetails}
            originalReportID={originalReportID}
            originalReport={originalReport}
            deleteReportActionDraft={deleteReportActionDraft}
            isArchivedRoom={isArchivedNonExpenseReport(originalReport, isOriginalReportArchived)}
            isChronosReport={chatIncludesChronosWithID(originalReportID)}
            resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
            resolveActionableMentionWhisper={resolveActionableMentionWhisper}
            isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses(iouReport, transactionsOnIOUReport)}
            getTransactionsWithReceipts={getTransactionsWithReceipts}
            clearError={clearError}
            clearAllRelatedReportActionErrors={clearAllRelatedReportActionErrors}
            userBillingFundID={userBillingFundID}
            isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
        />
    );
}

export default ReportActionItem;
