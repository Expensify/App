import {hasSeenTourSelector} from '@selectors/Onboarding';
import type {OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {hasOnlyNonReimbursableTransactions, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {approveMoneyRequest, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNonReimbursablePaymentModal from './useNonReimbursablePaymentModal';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import usePolicy from './usePolicy';

type ActionHandledType = DeepValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE.PAY | typeof CONST.IOU.REPORT_ACTION_TYPE.APPROVE>;

type UseHoldMenuSubmitParams = {
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;
    chatReport: OnyxEntry<OnyxTypes.Report>;
    requestType?: ActionHandledType;
    paymentType?: PaymentMethodType;
    methodID?: number;
    onClose: () => void;
    onConfirm?: (full: boolean) => void;
    transactions?: OnyxTypes.Transaction[];
};

function useHoldMenuSubmit({moneyRequestReport, chatReport, requestType, paymentType, methodID, onClose, onConfirm, transactions}: UseHoldMenuSubmitParams) {
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
    const {showNonReimbursablePaymentErrorModal} = useNonReimbursablePaymentModal(moneyRequestReport, transactions);

    const isApprove = requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE;

    const onSubmit = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (!isApprove && chatReport && hasOnlyNonReimbursableTransactions(moneyRequestReport?.reportID, transactions) && paymentType && paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            onClose();
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
        onClose();
    };

    return {onSubmit, isApprove};
}

export default useHoldMenuSubmit;
export type {ActionHandledType};
