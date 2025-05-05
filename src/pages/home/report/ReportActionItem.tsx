import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useBlockedFromConcierge} from '@components/OnyxProvider';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import {getIOUReportIDFromReportActionPreview, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    createDraftTransactionAndNavigateToParticipantSelector,
    getIndicatedMissingPaymentMethod,
    getOriginalReportID,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReportAutomaticallyForwardedMessage,
    getTransactionsWithReceipts,
    isArchivedNonExpenseReportWithID,
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
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';

function ReportActionItem({action, report, ...props}: PureReportActionItemProps) {
    const reportID = report?.reportID;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const originalReportID = useMemo(() => getOriginalReportID(reportID, action), [reportID, action]);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`, {canBeMissing: false});
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {
        canBeMissing: true,
        selector: (draftMessagesForReport) => {
            const matchingDraftMessage = draftMessagesForReport?.[action.reportActionID];
            return typeof matchingDraftMessage === 'string' ? matchingDraftMessage : matchingDraftMessage?.message;
        },
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getIOUReportIDFromReportActionPreview(action)}`, {canBeMissing: true});
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`, {canBeMissing: true});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: false});
    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID}`, {
        canBeMissing: true,
        selector: (transaction) => transaction?.errorFields?.route ?? null,
    });
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- This is needed to prevent the app from crashing when the app is using imported state.
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID || undefined}`, {canBeMissing: true});

    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID || undefined}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const blockedFromConcierge = useBlockedFromConcierge();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const linkedReport = isChatThread(report) ? parentReport : report;
    const missingPaymentMethod = getIndicatedMissingPaymentMethod(userWallet, linkedReport?.reportID, action);

    return (
        <PureReportActionItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            action={action}
            report={report}
            draftMessage={draftMessage}
            iouReport={iouReport}
            emojiReactions={emojiReactions}
            linkedTransactionRouteError={linkedTransactionRouteError}
            reportNameValuePairs={reportNameValuePairs}
            isUserValidated={isUserValidated}
            parentReport={parentReport}
            personalDetails={personalDetails}
            blockedFromConcierge={blockedFromConcierge}
            originalReportID={originalReportID}
            deleteReportActionDraft={deleteReportActionDraft}
            isArchivedRoom={isArchivedNonExpenseReportWithID(originalReport, isOriginalReportArchived)}
            isChronosReport={chatIncludesChronosWithID(originalReportID)}
            toggleEmojiReaction={toggleEmojiReaction}
            createDraftTransactionAndNavigateToParticipantSelector={createDraftTransactionAndNavigateToParticipantSelector}
            resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
            resolveActionableMentionWhisper={resolveActionableMentionWhisper}
            isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses(iouReport)}
            isCurrentUserTheOnlyParticipant={isCurrentUserTheOnlyParticipant}
            missingPaymentMethod={missingPaymentMethod}
            reimbursementDeQueuedOrCanceledActionMessage={getReimbursementDeQueuedOrCanceledActionMessage(
                action as OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED | typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED>>,
                report,
            )}
            modifiedExpenseMessage={ModifiedExpenseMessage.getForReportAction({reportOrID: reportID, reportAction: action})}
            getTransactionsWithReceipts={getTransactionsWithReceipts}
            clearError={clearError}
            clearAllRelatedReportActionErrors={clearAllRelatedReportActionErrors}
            dismissTrackExpenseActionableWhisper={dismissTrackExpenseActionableWhisper}
            userBillingFundID={userBillingFundID}
            reportAutomaticallyForwardedMessage={getReportAutomaticallyForwardedMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED>, reportID)}
        />
    );
}

export default ReportActionItem;
