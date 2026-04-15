import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import type {OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
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
};

function useHoldMenuSubmit({moneyRequestReport, chatReport, requestType, paymentType, methodID, onClose, onConfirm}: UseHoldMenuSubmitParams) {
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const activePolicy = usePolicy(activePolicyID);
    const policy = usePolicy(moneyRequestReport?.policyID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [moneyRequestReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const isApprove = requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE;

    const onSubmit = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
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
                expenseReportPolicy: policy,
                delegateEmail,
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
