import React, {useCallback, useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useBlockedFromConcierge} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
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
import type {PersonalDetailsList, Policy, Report, ReportAction, ReportActionReactions, Transaction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';

type ReportActionItemProps = Omit<
    PureReportActionItemProps,
    'taskReport' | 'linkedReport' | 'iouReportOfLinkedReport' | 'currentUserAccountID' | 'personalPolicyID' | 'allTransactionDrafts' | 'allReports' | 'policies'
> & {
    /** All the data of the report collection (optional when used from Search list; component subscribes at row level) */
    allReports?: OnyxCollection<Report>;

    /** All the data of the policy collection (optional when used from Search list; component subscribes at row level) */
    policies?: OnyxCollection<Policy>;

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
};

function ReportActionItem({
    allReports: allReportsProp,
    policies: policiesProp,
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
    ...props
}: ReportActionItemProps) {
    const {translate} = useLocalize();
    const reportID = report?.reportID;
    const originalMessage = getOriginalMessage(action);
    const originalReportID = useOriginalReportID(reportID, action);
    const iouReportID = getIOUReportIDFromReportActionPreview(action);
    const movedFromReportID = getMovedReportID(action, CONST.REPORT.MOVE_TYPE.FROM);
    const movedToReportID = getMovedReportID(action, CONST.REPORT.MOVE_TYPE.TO);
    const parentReportID = report?.parentReportID ?? undefined;
    const taskReportID = originalMessage && 'taskReportID' in originalMessage ? originalMessage.taskReportID : undefined;
    const linkedReportID = originalMessage && 'linkedReportID' in originalMessage ? originalMessage.linkedReportID : undefined;

    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(originalReportID)}`, {canBeMissing: true});
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(iouReportID)}`, {canBeMissing: true});
    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(movedFromReportID)}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(movedToReportID)}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(parentReportID)}`, {canBeMissing: true});
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(taskReportID)}`, {canBeMissing: true});
    const [linkedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(linkedReportID)}`, {canBeMissing: true});
    const [iouReportOfLinkedReport] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(linkedReport && 'iouReportID' in linkedReport ? linkedReport.iouReportID : undefined)}`,
        {canBeMissing: true},
    );
    const [policyFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`, {canBeMissing: true});

    const allReports = useMemo((): OnyxCollection<Report> => {
        if (allReportsProp) {
            return allReportsProp;
        }
        const key = (id: string | undefined) => (id ? `${ONYXKEYS.COLLECTION.REPORT}${id}` : '');
        const map: OnyxCollection<Report> = {};
        if (originalReportID && originalReport) {
            map[key(originalReportID)] = originalReport;
        }
        if (iouReportID && iouReport) {
            map[key(iouReportID)] = iouReport;
        }
        if (movedFromReportID && movedFromReport) {
            map[key(movedFromReportID)] = movedFromReport;
        }
        if (movedToReportID && movedToReport) {
            map[key(movedToReportID)] = movedToReport;
        }
        if (parentReportID && parentReport) {
            map[key(parentReportID)] = parentReport;
        }
        if (taskReportID && taskReport) {
            map[key(taskReportID)] = taskReport;
        }
        if (linkedReportID && linkedReport) {
            map[key(linkedReportID)] = linkedReport;
        }
        if (linkedReport && 'iouReportID' in linkedReport && iouReportOfLinkedReport) {
            map[key(linkedReport.iouReportID)] = iouReportOfLinkedReport;
        }
        if (reportID && report) {
            map[key(reportID)] = report;
        }
        return map;
    }, [
        allReportsProp,
        originalReportID,
        originalReport,
        iouReportID,
        iouReport,
        movedFromReportID,
        movedFromReport,
        movedToReportID,
        movedToReport,
        parentReportID,
        parentReport,
        taskReportID,
        taskReport,
        linkedReportID,
        linkedReport,
        iouReportOfLinkedReport,
        reportID,
        report,
    ]);

    // Narrow deps (report?.policyID) intentional; React Compiler infers broader `report`
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const policies = useMemo((): OnyxCollection<Policy> => {
        if (policiesProp) {
            return policiesProp;
        }
        if (!report?.policyID || !policyFromOnyx) {
            return {};
        }
        return {[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`]: policyFromOnyx};
    }, [policiesProp, report?.policyID, policyFromOnyx]);

    const originalReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`];
    const iouReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const movedFromReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`];
    const movedToReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`];
    const parentReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
    const taskReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`];
    const linkedReportResolved = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${linkedReportID}`];
    const iouReportOfLinkedReportResolved =
        linkedReportResolved && 'iouReportID' in linkedReportResolved ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${linkedReportResolved.iouReportID}`] : undefined;
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    // When an expense is moved from a self-DM to a workspace, the report's policyID is temporarily
    // set to a fake placeholder (CONST.POLICY.OWNER_EMAIL_FAKE). Looking up POLICY_TAGS with that
    // fake ID would return nothing, so we fall back to policyForMovingExpensesID (the actual
    // destination workspace) to fetch the correct tag list for display.
    const policyIDForTags = report?.policyID === CONST.POLICY.OWNER_EMAIL_FAKE && policyForMovingExpensesID ? policyForMovingExpensesID : report?.policyID;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyIDForTags}`, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {canBeMissing: true});
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const transactionsOnIOUReport = useReportTransactions(iouReportResolved?.reportID);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;

    const getLinkedTransactionRouteError = useCallback(
        (transaction: OnyxEntry<Transaction>) => {
            return linkedTransactionRouteErrorProp ?? transaction?.errorFields?.route;
        },
        [linkedTransactionRouteErrorProp],
    );

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true, selector: getLinkedTransactionRouteError});

    const blockedFromConcierge = useBlockedFromConcierge();
    const targetReport = isChatThread(report) ? parentReportResolved : report;
    const missingPaymentMethod = getIndicatedMissingPaymentMethod(userWalletTierName, targetReport?.reportID, action, bankAccountList);

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
            iouReport={iouReportResolved}
            taskReport={taskReportResolved}
            cardList={cardList}
            linkedReport={linkedReportResolved}
            iouReportOfLinkedReport={iouReportOfLinkedReportResolved}
            emojiReactions={emojiReactions}
            linkedTransactionRouteError={linkedTransactionRouteError}
            isUserValidated={isUserValidated}
            parentReport={parentReportResolved}
            personalDetails={personalDetails}
            blockedFromConcierge={blockedFromConcierge}
            originalReportID={originalReportID}
            originalReport={originalReportResolved}
            deleteReportActionDraft={deleteReportActionDraft}
            isArchivedRoom={isArchivedNonExpenseReport(originalReportResolved, isOriginalReportArchived)}
            isChronosReport={chatIncludesChronosWithID(originalReportID)}
            toggleEmojiReaction={toggleEmojiReaction}
            createDraftTransactionAndNavigateToParticipantSelector={createDraftTransactionAndNavigateToParticipantSelector}
            resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
            resolveActionableMentionWhisper={resolveActionableMentionWhisper}
            isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses(iouReportResolved, transactionsOnIOUReport)}
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
                movedFromReport: movedFromReportResolved,
                movedToReport: movedToReportResolved,
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
