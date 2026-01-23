import React, {useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {payMoneyRequest} from '@userActions/IOU';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DecisionModal from './DecisionModal';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';

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

    /** Number of transaction of a money request */
    transactionCount: number;

    /** Callback for displaying payment animation on IOU preview component */
    startAnimation?: () => void;

    /** Whether the report has non held expenses */
    hasNonHeldExpenses?: boolean;
};

function ProcessMoneyReportHoldMenu({
    nonHeldAmount = '0',
    fullAmount,
    onClose,
    isVisible,
    paymentType,
    chatReport,
    moneyRequestReport,
    transactionCount,
    startAnimation,
    hasNonHeldExpenses,
}: ProcessMoneyReportHoldMenuProps) {
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const activePolicy = usePolicy(activePolicyID);
    const policy = usePolicy(moneyRequestReport?.policyID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [moneyRequestReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const onSubmit = (full: boolean) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        if (chatReport && paymentType) {
            if (startAnimation) {
                startAnimation();
            }
            payMoneyRequest(paymentType, chatReport, moneyRequestReport, introSelected, moneyRequestReportNextStep, undefined, full, activePolicy, policy);
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
