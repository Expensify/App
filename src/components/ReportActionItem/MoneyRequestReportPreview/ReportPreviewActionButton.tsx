import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import ExportWithDropdownMenu from '@components/ReportActionItem/ExportWithDropdownMenu';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getConnectedIntegration, hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {hasPendingDEWSubmit} from '@libs/ReportActionsUtils';
import getReportPreviewAction from '@libs/ReportPreviewActionUtils';
import {getAddExpenseDropdownOptions} from '@libs/ReportUtils';
import variables from '@styles/variables';
import {canIOUBePaid as canIOUBePaidIOUActions} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import ApproveActionButton from './ApproveActionButton';
import PayActionButton from './PayActionButton';
import SubmitActionButton from './SubmitActionButton';

type ReportPreviewActionButtonProps = {
    iouReportID: string | undefined;
    chatReportID: string | undefined;
    isPaidAnimationRunning: boolean;
    isApprovedAnimationRunning: boolean;
    isSubmittingAnimationRunning: boolean;
    stopAnimation: () => void;
    startAnimation: () => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    onPaymentOptionsShow?: () => void;
    onPaymentOptionsHide?: () => void;
    openReportFromPreview: () => void;
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, canPay?: boolean) => void;
    transactionPreviewCarouselWidth: number;
};

function ReportPreviewActionButton({
    iouReportID,
    chatReportID,
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    isSubmittingAnimationRunning,
    stopAnimation,
    startAnimation,
    startApprovedAnimation,
    startSubmittingAnimation,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    openReportFromPreview,
    onHoldMenuOpen,
    transactionPreviewCarouselWidth,
}: ReportPreviewActionButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'ReceiptPlus', 'Plus']);

    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`);
    const {isOffline} = useNetwork();
    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    const transactions = Object.values(reportTransactionsCollection ?? {}).filter(
        (t): t is Transaction => !!t && (isOffline || t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );

    const isIouReportArchived = useReportIsArchived(iouReportID);
    const isChatReportArchived = useReportIsArchived(chatReportID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [iouReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReportID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    const isDEWSubmitPending = hasPendingDEWSubmit(iouReportMetadata, isDEWPolicy);
    const connectedIntegration = getConnectedIntegration(policy);

    const canIOUBePaid = canIOUBePaidIOUActions(iouReport, chatReport, policy, bankAccountList, transactions, false, undefined, invoiceReceiverPolicy);
    const onlyShowPayElsewhere = !canIOUBePaid && canIOUBePaidIOUActions(iouReport, chatReport, policy, bankAccountList, transactions, true, undefined, invoiceReceiverPolicy);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const buttonMaxWidth =
        !shouldUseNarrowLayout && transactionPreviewCarouselWidth >= CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.MIN_WIDE_WIDTH ? {maxWidth: transactionPreviewCarouselWidth} : {};

    const reportPreviewAction = getReportPreviewAction({
        isReportArchived: isIouReportArchived || isChatReportArchived,
        currentUserAccountID: currentUserDetails.accountID,
        currentUserLogin: currentUserDetails.login ?? '',
        report: iouReport,
        policy,
        transactions,
        bankAccountList,
        invoiceReceiverPolicy,
        isPaidAnimationRunning,
        isApprovedAnimationRunning,
        isSubmittingAnimationRunning,
        isDEWSubmitPending,
        violationsData: transactionViolations,
        reportMetadata: iouReportMetadata,
    });

    const renderButton = () => {
        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT) {
            return (
                <SubmitActionButton
                    iouReportID={iouReportID}
                    chatReportID={chatReportID}
                    isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                    stopAnimation={stopAnimation}
                    startSubmittingAnimation={startSubmittingAnimation}
                />
            );
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE) {
            return (
                <ApproveActionButton
                    iouReportID={iouReportID}
                    startApprovedAnimation={startApprovedAnimation}
                    onHoldMenuOpen={onHoldMenuOpen}
                    shouldShowPayButton={shouldShowPayButton}
                />
            );
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY) {
            return (
                <PayActionButton
                    iouReportID={iouReportID}
                    chatReportID={chatReportID}
                    isPaidAnimationRunning={isPaidAnimationRunning}
                    isApprovedAnimationRunning={isApprovedAnimationRunning}
                    stopAnimation={stopAnimation}
                    startAnimation={startAnimation}
                    startApprovedAnimation={startApprovedAnimation}
                    onPaymentOptionsShow={onPaymentOptionsShow}
                    onPaymentOptionsHide={onPaymentOptionsHide}
                    onHoldMenuOpen={onHoldMenuOpen}
                    buttonMaxWidth={buttonMaxWidth}
                    reportPreviewAction={reportPreviewAction}
                />
            );
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING && connectedIntegration) {
            return (
                <ExportWithDropdownMenu
                    report={iouReport}
                    reportActions={reportActions}
                    connectionName={connectedIntegration}
                    wrapperStyle={styles.flexReset}
                    dropdownAnchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.EXPORT_BUTTON}
                />
            );
        }

        if (reportPreviewAction === CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE) {
            return (
                <ButtonWithDropdownMenu
                    onPress={() => {}}
                    shouldAlwaysShowDropdownMenu
                    customText={translate('iou.addExpense')}
                    options={getAddExpenseDropdownOptions({
                        translate,
                        icons: expensifyIcons,
                        iouReportID: iouReport?.reportID,
                        policy,
                        userBillingGracePeriodEnds,
                        draftTransactionIDs,
                        amountOwed,
                        ownerBillingGracePeriodEnd,
                        iouRequestBackToReport: chatReportID,
                        unreportedExpenseBackToReport: iouReport?.parentReportID,
                        lastDistanceExpenseType,
                    })}
                    isSplitButton={false}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.ADD_EXPENSE_BUTTON}
                />
            );
        }

        return (
            <Button
                text={translate('common.view')}
                onPress={openReportFromPreview}
                sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.VIEW_BUTTON}
            />
        );
    };

    return <View style={[buttonMaxWidth, styles.flex1, {height: variables.h40}]}>{renderButton()}</View>;
}

export default ReportPreviewActionButton;
