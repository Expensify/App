import {hasSeenTourSelector} from '@selectors/Onboarding';
import type {OnyxEntry} from 'react-native-onyx';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {hasOnlyNonReimbursableTransactions} from '@libs/ReportUtils';
import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

type ActionHandledType = DeepValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE.PAY | typeof CONST.IOU.REPORT_ACTION_TYPE.APPROVE>;

type UseHoldMenuSubmitParams = {
    moneyRequestReport: OnyxEntry<OnyxTypes.Report>;
    chatReport: OnyxEntry<OnyxTypes.Report>;
    paymentType?: PaymentMethodType;
    methodID?: number;
    onClose: () => void;
    onConfirm?: (full: boolean) => void;
};

function useHoldMenuSubmit({moneyRequestReport, chatReport, paymentType, methodID, onClose, onConfirm}: UseHoldMenuSubmitParams) {
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

        const animationCallback = () => onConfirm?.(full);
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
                onPaid: animationCallback,
            });
        }
        onClose();
    };

    return {onSubmit};
}

export default useHoldMenuSubmit;
export type {ActionHandledType};
