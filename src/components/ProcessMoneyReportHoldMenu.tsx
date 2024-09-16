import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import {isLinkedTransactionHeld} from '@libs/ReportActionsUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import DecisionModal from './DecisionModal';

type ActionHandledType = DeepValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE.PAY | typeof CONST.IOU.REPORT_ACTION_TYPE.APPROVE>;

type ProcessMoneyReportHoldMenuProps = {
    /** The chat report this report is linked to */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** Full amount of expense report to pay */
    fullAmount: string;

    /** Whether modal is visible */
    isVisible: boolean;

    /** The report currently being looked at */
    moneyRequestReport: OnyxTypes.Report;

    /** Not held amount of expense report */
    nonHeldAmount?: string;

    /** Callback for closing modal */
    onClose: () => void;

    /** Type of payment */
    paymentType?: PaymentMethodType;

    /** Type of action handled */
    requestType?: ActionHandledType;

    /** Number of transaction of a money request */
    transactionCount: number;
};

function ProcessMoneyReportHoldMenu({
    requestType,
    nonHeldAmount,
    fullAmount,
    onClose,
    isVisible,
    paymentType,
    chatReport,
    moneyRequestReport,
    transactionCount,
}: ProcessMoneyReportHoldMenuProps) {
    const {translate} = useLocalize();
    const isApprove = requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE;
    // We need to use shouldUseNarrowLayout instead of shouldUseNarrowLayout to apply the correct modal type
    const {isSmallScreenWidth} = useResponsiveLayout();

    const onSubmit = (full: boolean) => {
        if (isApprove) {
            IOU.approveMoneyRequest(moneyRequestReport, full);
            if (!full && isLinkedTransactionHeld(Navigation.getTopmostReportActionId() ?? '-1', moneyRequestReport.reportID)) {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(moneyRequestReport.reportID));
            }
        } else if (chatReport && paymentType) {
            IOU.payMoneyRequest(paymentType, chatReport, moneyRequestReport, full);
        }
        onClose();
    };

    const promptText = useMemo(() => {
        if (nonHeldAmount) {
            return translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount');
        }
        return translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', {transactionCount});
    }, [nonHeldAmount, transactionCount, translate, isApprove]);

    return (
        <DecisionModal
            title={translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay')}
            onClose={onClose}
            isVisible={isVisible}
            prompt={promptText}
            firstOptionText={nonHeldAmount ? `${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${nonHeldAmount}` : undefined}
            secondOptionText={`${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`}
            onFirstOptionSubmit={() => onSubmit(false)}
            onSecondOptionSubmit={() => onSubmit(true)}
            isSmallScreenWidth={isSmallScreenWidth}
        />
    );
}

ProcessMoneyReportHoldMenu.displayName = 'ProcessMoneyReportHoldMenu';

export default ProcessMoneyReportHoldMenu;
export type {ActionHandledType};
