import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {useBlockedFromConcierge, usePersonalDetails} from '@components/OnyxProvider';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import * as ReportActions from '@userActions/ReportActions';
import * as Transaction from '@userActions/Transaction';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {PureReportActionItemProps} from './PureReportActionItem';
import PureReportActionItem from './PureReportActionItem';

function ReportActionItem({action, report, ...props}: PureReportActionItemProps) {
    const reportID = report?.reportID ?? '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const originalReportID = useMemo(() => ReportUtils.getOriginalReportID(reportID, action) || '-1', [reportID, action]);
    const [draftMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {
        selector: (draftMessagesForReport) => {
            const matchingDraftMessage = draftMessagesForReport?.[action.reportActionID];
            return typeof matchingDraftMessage === 'string' ? matchingDraftMessage : matchingDraftMessage?.message;
        },
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${ReportActionsUtils.getIOUReportIDFromReportActionPreview(action) ?? -1}`);
    const [emojiReactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [linkedTransactionRouteError] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${ReportActionsUtils.isMoneyRequestAction(action) ? ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID ?? -1 : -1}`,
        {selector: (transaction) => transaction?.errorFields?.route ?? null},
    );
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- This is needed to prevent the app from crashing when the app is using imported state.
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID || '-1'}`);

    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID || -1}`);
    const personalDetails = usePersonalDetails();
    const blockedFromConcierge = useBlockedFromConcierge();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const linkedReport = ReportUtils.isChatThread(report) ? parentReport : report;
    const missingPaymentMethod = ReportUtils.getIndicatedMissingPaymentMethod(userWallet, linkedReport?.reportID ?? '-1', action);

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
            deleteReportActionDraft={Report.deleteReportActionDraft}
            isArchivedRoom={ReportUtils.isArchivedRoomWithID(originalReportID)}
            isChronosReport={ReportUtils.chatIncludesChronosWithID(originalReportID)}
            toggleEmojiReaction={Report.toggleEmojiReaction}
            createDraftTransactionAndNavigateToParticipantSelector={ReportUtils.createDraftTransactionAndNavigateToParticipantSelector}
            resolveActionableReportMentionWhisper={Report.resolveActionableReportMentionWhisper}
            resolveActionableMentionWhisper={Report.resolveActionableMentionWhisper}
            isClosedExpenseReportWithNoExpenses={ReportUtils.isClosedExpenseReportWithNoExpenses(iouReport)}
            isCurrentUserTheOnlyParticipant={ReportUtils.isCurrentUserTheOnlyParticipant}
            missingPaymentMethod={missingPaymentMethod}
            reimbursementDeQueuedActionMessage={ReportUtils.getReimbursementDeQueuedActionMessage(
                action as OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED>>,
                report,
            )}
            modifiedExpenseMessage={ModifiedExpenseMessage.getForReportAction(reportID, action)}
            getTransactionsWithReceipts={ReportUtils.getTransactionsWithReceipts}
            clearError={Transaction.clearError}
            clearAllRelatedReportActionErrors={ReportActions.clearAllRelatedReportActionErrors}
            dismissTrackExpenseActionableWhisper={Report.dismissTrackExpenseActionableWhisper}
            userBillingFundID={userBillingFundID}
            reportAutomaticallyForwardedMessage={ReportUtils.getReportAutomaticallyForwardedMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED>, reportID)}
        />
    );
}

export default ReportActionItem;
