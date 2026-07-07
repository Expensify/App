import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';

import {getReportOrDraftReport} from '@libs/ReportUtils';

import {payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';

import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePayChatReportActions from './usePayChatReportActions';
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
    const chatReportPolicy = usePolicy(chatReport?.policyID);
    const getChatReportActions = usePayChatReportActions(chatReport, undefined);
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
            // moneyRequestReport/chatReport can be lightweight versions of the report (the report list drops fields
            // like the last message text/time so it doesn't re-render on every new message). The pay/approve actions
            // restore the report on failure by merging it back in, so we grab the full reports here to make sure the
            // chat's last message comes back correctly if the payment fails.
            const currentMoneyRequestReport = getReportOrDraftReport(moneyRequestReport?.reportID) ?? moneyRequestReport;
            const currentChatReport = getReportOrDraftReport(chatReport?.reportID) ?? chatReport;
            payMoneyRequest({
                paymentType,
                chatReport: currentChatReport,
                iouReport: currentMoneyRequestReport,
                introSelected,
                iouReportCurrentNextStepDeprecated: moneyRequestReportNextStep,
                currentUserAccountID: currentUserDetails.accountID,
                currentUserLogin: currentUserDetails.login ?? '',
                full,
                activePolicy,
                policy,
                chatReportPolicy,
                betas,
                isSelfTourViewed,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                methodID,
                onPaid: animationCallback,
                chatReportActions: getChatReportActions(false),
            });
        }
        onClose();
    };

    return {onSubmit};
}

export default useHoldMenuSubmit;
export type {ActionHandledType};
