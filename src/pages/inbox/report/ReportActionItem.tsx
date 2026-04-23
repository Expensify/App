import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getIOUReportIDFromReportActionPreview, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    getIndicatedMissingPaymentMethod,
    getTransactionsWithReceipts,
    isArchivedNonExpenseReport,
    isChatThread,
    isClosedExpenseReportWithNoExpenses,
    isCurrentUserTheOnlyParticipant,
} from '@libs/ReportUtils';
import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {deleteReportActionDraft, resolveActionableMentionWhisper, resolveActionableReportMentionWhisper} from '@userActions/Report';
import {clearError} from '@userActions/Transaction';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Transaction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';

type ReportActionItemProps = Omit<PureReportActionItemProps, 'taskReport' | 'linkedReport' | 'iouReportOfLinkedReport' | 'personalPolicyID' | 'betas'> & {
    /** Whether to show the draft message or not */
    shouldShowDraftMessage?: boolean;

    /** Draft message for the report action */
    draftMessage?: string;

    /** User wallet tierName */
    userWalletTierName: string | undefined;

    /** Whether the user is validated */
    isUserValidated: boolean | undefined;

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
    userWalletTierName,
    isUserValidated,
    personalDetails,
    userBillingFundID,
    linkedTransactionRouteError: linkedTransactionRouteErrorProp,
    isTryNewDotNVPDismissed,
    ...props
}: ReportActionItemProps) {
    const reportID = report?.reportID;
    const originalMessage = getOriginalMessage(action);
    const originalReportID = useOriginalReportID(reportID, action);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getIOUReportIDFromReportActionPreview(action)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);

    const taskReportID = originalMessage && 'taskReportID' in originalMessage ? originalMessage.taskReportID : undefined;
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`);
    const linkedReportID = originalMessage && 'linkedReportID' in originalMessage ? originalMessage.linkedReportID : undefined;
    const [linkedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${linkedReportID}`);
    const iouReportOfLinkedReportID = linkedReport && 'iouReportID' in linkedReport ? linkedReport.iouReportID : undefined;
    const [iouReportOfLinkedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportOfLinkedReportID}`);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const transactionsOnIOUReport = useReportTransactions(iouReport?.reportID);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;

    const getLinkedTransactionRouteError = useCallback(
        (transaction: OnyxEntry<Transaction>) => {
            return linkedTransactionRouteErrorProp ?? transaction?.errorFields?.route;
        },
        [linkedTransactionRouteErrorProp],
    );

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector: getLinkedTransactionRouteError});

    const targetReport = isChatThread(report) ? parentReport : report;
    const missingPaymentMethod = getIndicatedMissingPaymentMethod(userWalletTierName, targetReport?.reportID, action, bankAccountList);

    return (
        <PureReportActionItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            introSelected={introSelected}
            betas={betas}
            personalPolicyID={personalPolicyID}
            action={action}
            report={report}
            policy={policy}
            draftMessage={draftMessage}
            iouReport={iouReport}
            taskReport={taskReport}
            linkedReport={linkedReport}
            iouReportOfLinkedReport={iouReportOfLinkedReport}
            linkedTransactionRouteError={linkedTransactionRouteError}
            isUserValidated={isUserValidated}
            parentReport={parentReport}
            personalDetails={personalDetails}
            originalReportID={originalReportID}
            originalReport={originalReport}
            deleteReportActionDraft={deleteReportActionDraft}
            isArchivedRoom={isArchivedNonExpenseReport(originalReport, isOriginalReportArchived)}
            isChronosReport={chatIncludesChronosWithID(originalReportID)}
            resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
            resolveActionableMentionWhisper={resolveActionableMentionWhisper}
            isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses(iouReport, transactionsOnIOUReport)}
            isCurrentUserTheOnlyParticipant={isCurrentUserTheOnlyParticipant}
            missingPaymentMethod={missingPaymentMethod}
            getTransactionsWithReceipts={getTransactionsWithReceipts}
            clearError={clearError}
            clearAllRelatedReportActionErrors={clearAllRelatedReportActionErrors}
            userBillingFundID={userBillingFundID}
            isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
            bankAccountList={bankAccountList}
            reportMetadata={reportMetadata}
        />
    );
}

export default ReportActionItem;
