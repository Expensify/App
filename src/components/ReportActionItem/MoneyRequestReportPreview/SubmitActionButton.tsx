import React from 'react';
import AnimatedSubmitButton from '@components/AnimatedSubmitButton';
import useConfirmPendingRTERAndProceed from '@hooks/useConfirmPendingRTERAndProceed';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import Navigation from '@libs/Navigation/Navigation';
import {canSubmitAndIsAwaitingForCurrentUser} from '@libs/ReportUtils';
import {hasAnyPendingRTERViolation as hasAnyPendingRTERViolationTransactionUtils} from '@libs/TransactionUtils';
import {markPendingRTERTransactionsAsCash} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

type SubmitActionButtonProps = {
    iouReportID: string | undefined;
    chatReportID: string | undefined;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startSubmittingAnimation: () => void;
};

function SubmitActionButton({iouReportID, chatReportID, isSubmittingAnimationRunning, stopAnimation, startSubmittingAnimation}: SubmitActionButtonProps) {
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const {isOffline} = useNetwork();
    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const transactions = Object.values(reportTransactionsCollection ?? {}).filter(
        (t): t is Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );

    const hasAnyPendingRTERViolation = hasAnyPendingRTERViolationTransactionUtils(transactions, transactionViolations, currentUserEmail, currentUserAccountID, iouReport, policy);

    const handleMarkPendingRTERTransactionsAsCash = () => {
        markPendingRTERTransactionsAsCash(transactions, transactionViolations, Object.values(reportActions ?? {}));
    };

    const confirmPendingRTERAndProceed = useConfirmPendingRTERAndProceed(hasAnyPendingRTERViolation, handleMarkPendingRTERTransactionsAsCash);

    const isWaitingForSubmissionFromCurrentUser = canSubmitAndIsAwaitingForCurrentUser(
        iouReport,
        chatReport,
        policy,
        transactions,
        transactionViolations,
        currentUserEmail,
        currentUserAccountID,
        reportActions,
    );

    return (
        <AnimatedSubmitButton
            success={isWaitingForSubmissionFromCurrentUser}
            text={translate('common.submit')}
            onPress={() => {
                confirmPendingRTERAndProceed(() => {
                    if (!iouReportID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.REPORT_SUBMIT_TO.getRoute(iouReportID, Navigation.getActiveRoute()));
                });
            }}
            isSubmittingAnimationRunning={isSubmittingAnimationRunning}
            onAnimationFinish={stopAnimation}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.SUBMIT_BUTTON}
        />
    );
}

export default SubmitActionButton;
