import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';
import DecisionModal from '@components/DecisionModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNonReimbursablePaymentModal from '@hooks/useNonReimbursablePaymentModal';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {hasOnlyNonReimbursableTransactions, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {ModalProps} from './ModalContext';

type ActionHandledType = DeepValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE.PAY | typeof CONST.IOU.REPORT_ACTION_TYPE.APPROVE>;

type HoldMenuModalWrapperProps = ModalProps & {
    reportID: string | undefined;
    chatReportID: string | undefined;
    requestType: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    nonHeldAmount?: string;
    fullAmount: string;
    hasNonHeldExpenses?: boolean;
    transactionCount: number;
    onConfirm?: (full: boolean) => void;
};

function HoldMenuModalWrapper({
    closeModal,
    reportID,
    chatReportID,
    requestType,
    paymentType,
    methodID,
    nonHeldAmount = '0',
    fullAmount,
    hasNonHeldExpenses,
    transactionCount,
    onConfirm,
}: HoldMenuModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const {translate} = useLocalize();
    const isApprove = requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const activePolicy = usePolicy(activePolicyID);
    const policy = usePolicy(moneyRequestReport?.policyID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [moneyRequestReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const {showNonReimbursablePaymentErrorModal} = useNonReimbursablePaymentModal(moneyRequestReport, transactions);

    const onSubmit = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (!isApprove && chatReport && hasOnlyNonReimbursableTransactions(moneyRequestReport?.reportID, transactions) && paymentType && paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            setIsVisible(false);
            showNonReimbursablePaymentErrorModal();
            return;
        }

        const animationCallback = () => onConfirm?.(full);

        if (isApprove) {
            approveMoneyRequest({
                expenseReport: moneyRequestReport,
                policy: activePolicy,
                currentUserAccountIDParam: currentUserDetails.accountID,
                currentUserEmailParam: currentUserDetails.email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: moneyRequestReportNextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                full,
                onApproved: animationCallback,
            });
        } else if (chatReport && paymentType) {
            payMoneyRequest({
                paymentType,
                chatReport,
                iouReport: moneyRequestReport,
                introSelected,
                iouReportCurrentNextStepDeprecated: moneyRequestReportNextStep,
                currentUserAccountID: currentUserDetails.accountID,
                full,
                activePolicy,
                policy,
                betas,
                isSelfTourViewed,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                methodID,
                onPaid: animationCallback,
            });
        }
        setIsVisible(false);
    };

    const promptText = (() => {
        if (hasNonHeldExpenses) {
            return translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount');
        }
        return translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', {count: transactionCount});
    })();

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={() => setIsVisible(false)}
            isVisible={isVisible}
            prompt={promptText}
            firstOptionText={hasNonHeldExpenses ? `${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${nonHeldAmount}` : undefined}
            secondOptionText={`${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
            onModalHide={() => {
                if (isVisible) {
                    return;
                }
                closeModal({action: 'CLOSE'});
            }}
        />
    );
}

export default HoldMenuModalWrapper;
export type {ActionHandledType, HoldMenuModalWrapperProps};
