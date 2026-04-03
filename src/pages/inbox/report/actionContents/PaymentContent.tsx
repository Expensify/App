import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getBankAccountLastFourDigits} from '@libs/PaymentUtils';
import {getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PaymentContentProps = {
    action: OnyxTypes.ReportAction;
    bankAccountList: OnyxTypes.BankAccountList | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function PaymentContent({action: rawAction, bankAccountList, policy}: PaymentContentProps) {
    const {translate} = useLocalize();

    // Narrow the action type — this component is only rendered for IOU PAY actions
    if (!isActionOfType(rawAction, CONST.REPORT.ACTIONS.TYPE.IOU)) {
        return null;
    }
    const action = rawAction;

    const wasAutoPaid = getOriginalMessage(action)?.automaticAction ?? false;
    const paymentType = getOriginalMessage(action)?.paymentType;

    if (paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        return <ReportActionItemBasicMessage message={translate('iou.paidElsewhere')} />;
    }

    if (paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
        const originalMessage = getOriginalMessage(action);
        const last4Digits = getBankAccountLastFourDigits(originalMessage?.bankAccountID, bankAccountList, policy);
        if (wasAutoPaid) {
            const translation = translate('iou.automaticallyPaidWithBusinessBankAccount', '', last4Digits);

            return (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${translation}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        }
        return <ReportActionItemBasicMessage message={translate('iou.businessBankAccount', '', last4Digits)} />;
    }

    if (wasAutoPaid) {
        return (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyPaidWithExpensify')}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }

    const originalMessage = getOriginalMessage(action);
    const amount = convertToDisplayString(Math.abs(originalMessage?.amount ?? 0), originalMessage?.currency);
    if (originalMessage?.bankAccountID) {
        const bankAccount = bankAccountList?.[originalMessage.bankAccountID];
        return (
            <ReportActionItemBasicMessage
                message={translate(
                    originalMessage?.payAsBusiness ? 'iou.settleInvoiceBusiness' : 'iou.settleInvoicePersonal',
                    amount,
                    bankAccount?.accountData?.accountNumber?.slice(-4) ?? '',
                )}
            />
        );
    }
    return <ReportActionItemBasicMessage message={translate('iou.paidWithExpensify')} />;
}

PaymentContent.displayName = 'PaymentContent';

export default PaymentContent;
