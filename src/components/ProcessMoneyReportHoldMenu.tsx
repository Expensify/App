import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {hasOnlyNonReimbursableTransactions} from '@libs/ReportUtils';
import {payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DecisionModal from './DecisionModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';

type ActionHandledType = DeepValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE.PAY | typeof CONST.IOU.REPORT_ACTION_TYPE.APPROVE>;

type ProcessMoneyReportHoldMenuProps = {
    /** The chat report this report is linked to */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** Full amount of expense report to pay */
    fullAmount: string;

    /** Whether modal is visible */
    isVisible: boolean;

    /** The report currently being looked at */
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;

    /** Not held amount of expense report */
    nonHeldAmount?: string;

    /** Callback for closing modal */
    onClose: () => void;

    /** Type of payment */
    paymentType?: PaymentMethodType;

    /** Selected VBBA ID for payment */
    methodID?: number;

    /** Number of transaction of a money request */
    transactionCount: number;

    /** Callback for displaying payment animation on IOU preview component */
    startAnimation?: () => void;

    /** Whether the report has non held expenses */
    hasNonHeldExpenses?: boolean;

    /** Callback when user attempts to pay via ACH but report has only non-reimbursable expenses */
    onNonReimbursablePaymentError?: () => void;

    /** Transactions associated with report */
    transactions?: OnyxTypes.Transaction[];
};

function ProcessMoneyReportHoldMenu({
    nonHeldAmount = '0',
    fullAmount,
    onClose,
    isVisible,
    paymentType,
    methodID,
    chatReport,
    moneyRequestReport,
    transactionCount,
    startAnimation,
    hasNonHeldExpenses,
    onNonReimbursablePaymentError,
    transactions,
}: ProcessMoneyReportHoldMenuProps) {
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
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
    const currentUserDetails = useCurrentUserPersonalDetails();

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const onSubmit = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (chatReport && hasOnlyNonReimbursableTransactions(moneyRequestReport?.reportID, transactions) && paymentType && paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            onClose();
            onNonReimbursablePaymentError?.();
            return;
        }

        if (chatReport && paymentType) {
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
                onPaid: startAnimation,
            });
        }
        onClose();
    };

    const promptText = hasNonHeldExpenses ? translate('iou.confirmPayAmount') : translate('iou.confirmPayAllHoldAmount', {count: transactionCount});

    return (
        <DecisionModal
            title={translate('iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={promptText}
            firstOptionText={hasNonHeldExpenses ? `${translate('iou.payOnly')} ${nonHeldAmount}` : undefined}
            secondOptionText={`${translate('iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
        />
    );
}

export default ProcessMoneyReportHoldMenu;
export type {ActionHandledType};
