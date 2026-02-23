import React, {useCallback} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useBlockedFromConcierge} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import {getForReportActionTemp, getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getIOUReportIDFromReportActionPreview, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    createDraftTransactionAndNavigateToParticipantSelector,
    getIndicatedMissingPaymentMethod,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getTransactionsWithReceipts,
    isArchivedNonExpenseReport,
    isChatThread,
    isClosedExpenseReportWithNoExpenses,
    isCurrentUserTheOnlyParticipant,
} from '@libs/ReportUtils';
import {
    deleteReportActionDraft,
    dismissTrackExpenseActionableWhisper,
    resolveActionableMentionWhisper,
    resolveActionableReportMentionWhisper,
    toggleEmojiReaction,
} from '@userActions/Report';
import {clearAllRelatedReportActionErrors} from '@userActions/ReportActions';
import {clearError} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyTagLists, Report, ReportAction, ReportActionReactions, Transaction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';

type ReportActionItemProps = Omit<PureReportActionItemProps, 'taskReport' | 'linkedReport' | 'iouReportOfLinkedReport' | 'currentUserAccountID'> & {
    /** All the data of the report collection */
    allReports: OnyxCollection<Report>;

    /** All the data of the policy collection */
    policies: OnyxCollection<Policy>;

    /** Whether to show the draft message or not */
    shouldShowDraftMessage?: boolean;

    /** Draft message for the report action */
    draftMessage?: string;

    /** Emoji reactions for the report action */
    emojiReactions?: OnyxEntry<ReportActionReactions>;

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

    /** Policy tags for the report's workspace */
    policyTags?: OnyxEntry<PolicyTagLists>;
};

function ReportActionItem({
    allReports,
    policies,
    action,
    report,
    draftMessage,
    emojiReactions,
    userWalletTierName,
    isUserValidated,
    personalDetails,
    userBillingFundID,
    linkedTransactionRouteError: linkedTransactionRouteErrorProp,
    isTryNewDotNVPDismissed,
    introSelected,
    allTransactionDrafts,
    reportMetadata,
    cardList,
    bankAccountList,
    personalPolicyID,
    policyTags,
    ...props
}: ReportActionItemProps) {
    const {translate} = useLocalize();
    const reportID = report?.reportID;
    const originalMessage = getOriginalMessage(action);
    const originalReportID = useOriginalReportID(reportID, action);
    const originalReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`];
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getIOUReportIDFromReportActionPreview(action)}`];
    const movedFromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(action, CONST.REPORT.MOVE_TYPE.FROM)}`];
    const movedToReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(action, CONST.REPORT.MOVE_TYPE.TO)}`];
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const transactionsOnIOUReport = useReportTransactions(iouReport?.reportID);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;

    const getLinkedTransactionRouteError = useCallback(
        (transaction: OnyxEntry<Transaction>) => {
            return linkedTransactionRouteErrorProp ?? transaction?.errorFields?.route;
        },
        [linkedTransactionRouteErrorProp],
    );

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true, selector: getLinkedTransactionRouteError});

    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID || undefined}`];
    const blockedFromConcierge = useBlockedFromConcierge();
    const targetReport = isChatThread(report) ? parentReport : report;
    const missingPaymentMethod = getIndicatedMissingPaymentMethod(userWalletTierName, targetReport?.reportID, action, bankAccountList);

    const taskReport = originalMessage && 'taskReportID' in originalMessage ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalMessage.taskReportID}`] : undefined;
    const linkedReport = originalMessage && 'linkedReportID' in originalMessage ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalMessage.linkedReportID}`] : undefined;
    const iouReportOfLinkedReport = linkedReport && 'iouReportID' in linkedReport ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${linkedReport.iouReportID}`] : undefined;

    return (
        <PureReportActionItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            allReports={allReports}
            introSelected={introSelected}
            allTransactionDrafts={allTransactionDrafts}
            policies={policies}
            personalPolicyID={personalPolicyID}
            action={action}
            report={report}
            policy={policy}
            currentUserAccountID={currentUserAccountID}
            draftMessage={draftMessage}
            iouReport={iouReport}
            taskReport={taskReport}
            cardList={cardList}
            linkedReport={linkedReport}
            iouReportOfLinkedReport={iouReportOfLinkedReport}
            emojiReactions={emojiReactions}
            linkedTransactionRouteError={linkedTransactionRouteError}
            isUserValidated={isUserValidated}
            parentReport={parentReport}
            personalDetails={personalDetails}
            blockedFromConcierge={blockedFromConcierge}
            originalReportID={originalReportID}
            originalReport={originalReport}
            deleteReportActionDraft={deleteReportActionDraft}
            isArchivedRoom={isArchivedNonExpenseReport(originalReport, isOriginalReportArchived)}
            isChronosReport={chatIncludesChronosWithID(originalReportID)}
            toggleEmojiReaction={toggleEmojiReaction}
            createDraftTransactionAndNavigateToParticipantSelector={createDraftTransactionAndNavigateToParticipantSelector}
            resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
            resolveActionableMentionWhisper={resolveActionableMentionWhisper}
            isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses(iouReport, transactionsOnIOUReport)}
            isCurrentUserTheOnlyParticipant={isCurrentUserTheOnlyParticipant}
            missingPaymentMethod={missingPaymentMethod}
            reimbursementDeQueuedOrCanceledActionMessage={getReimbursementDeQueuedOrCanceledActionMessage(
                translate,
                action as OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED | typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED>>,
                report,
            )}
            modifiedExpenseMessage={getForReportActionTemp({
                translate,
                reportAction: action,
                policy,
                movedFromReport,
                movedToReport,
                policyTags: policyTags ?? CONST.POLICY.DEFAULT_TAG_LIST,
                currentUserLogin: currentUserEmail ?? '',
            })}
            getTransactionsWithReceipts={getTransactionsWithReceipts}
            clearError={clearError}
            clearAllRelatedReportActionErrors={clearAllRelatedReportActionErrors}
            dismissTrackExpenseActionableWhisper={dismissTrackExpenseActionableWhisper}
            userBillingFundID={userBillingFundID}
            isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
            bankAccountList={bankAccountList}
            reportMetadata={reportMetadata}
        />
    );
}

export default ReportActionItem;
