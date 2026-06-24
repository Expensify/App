import React from 'react';
import type {CallContext} from 'react-call';
import * as Decision from '@components/Modal/v2/decision';
import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {DialogActions} from './actions';
import type {DialogResponse} from './actions';
import createDialogCallable from './createDialogCallable';
import type {HoldMenuCallProps} from './types';

type HoldMenuCtx = CallContext<HoldMenuCallProps, DialogResponse, Record<string, never>>;

type HoldMenuInnerProps = HoldMenuCallProps & {call: HoldMenuCtx};

function HoldMenuInner(props: HoldMenuInnerProps) {
    const {call, reportID, chatReportID, requestType, paymentType, methodID, fullAmount, onConfirm} = props;
    const moneyRequestReportOverride = props.moneyRequestReport;
    const chatReportOverride = props.chatReport;
    const {translate} = useLocalize();

    const [moneyRequestReportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReportFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const moneyRequestReport = moneyRequestReportOverride ?? moneyRequestReportFromOnyx;
    const chatReport = chatReportOverride ?? chatReportFromOnyx;

    const {onSubmit, isApprove} = useHoldMenuSubmit({
        moneyRequestReport,
        chatReport,
        requestType,
        paymentType,
        methodID,
        onClose: () => call.end({action: DialogActions.CONFIRM}),
        onConfirm,
    });

    const cancel = () => call.end({action: DialogActions.CLOSE});
    const onOpenChange = (open: boolean) => {
        if (open) {
            return;
        }
        cancel();
    };

    const title = translate(isApprove ? 'iou.confirmApprove' : 'iou.confirmPay');
    const fullOptionText = `${translate(isApprove ? 'iou.approve' : 'iou.pay')} ${fullAmount}`;
    const hasPartial = 'nonHeldAmount' in props && props.nonHeldAmount !== undefined;

    return (
        <Decision.Root
            isOpen={!call.ended}
            onOpenChange={onOpenChange}
        >
            <Decision.Title>{title}</Decision.Title>
            <Decision.Description>
                {hasPartial
                    ? translate(isApprove ? 'iou.confirmApprovalAmount' : 'iou.confirmPayAmount')
                    : translate(isApprove ? 'iou.confirmApprovalAllHoldAmount' : 'iou.confirmPayAllHoldAmount', {count: props.transactionCount})}
            </Decision.Description>
            {hasPartial ? (
                <>
                    <Decision.Option
                        position="primary"
                        text={`${translate(isApprove ? 'iou.approveOnly' : 'iou.payOnly')} ${props.nonHeldAmount}`}
                        onPress={() => onSubmit(false)}
                        variant="primary"
                    />
                    <Decision.Option
                        position="secondary"
                        text={fullOptionText}
                        onPress={() => onSubmit(true)}
                        variant="neutral"
                    />
                </>
            ) : (
                <Decision.Option
                    position="sole"
                    text={fullOptionText}
                    onPress={() => onSubmit(true)}
                    variant="primary"
                />
            )}
        </Decision.Root>
    );
}

const HoldMenu = createDialogCallable<HoldMenuCallProps>('HoldMenu', HoldMenuInner);

export default HoldMenu;
