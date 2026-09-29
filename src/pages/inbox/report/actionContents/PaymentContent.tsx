import RenderHTML from '@components/RenderHTML';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getBankAccountLastFourDigits from '@libs/getBankAccountLastFourDigits';
import {getCrossBorderReimbursedMessage, getElsewherePaymentReportActionMessage, getOriginalMessage, getPaymentMessageWithExpectedDate} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import {policyACHAccountNumberSelector} from '@selectors/Policy';
import React from 'react';

type PaymentContentProps = {
    action: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
    expectedDate: string | undefined;
    policyID: string | undefined;
};

function PaymentContent({action, expectedDate, policyID}: PaymentContentProps) {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policyACHAccountNumber] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyACHAccountNumberSelector});
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const originalMessage = getOriginalMessage(action);

    if (!originalMessage) {
        return null;
    }

    const paymentType = originalMessage.paymentType;
    const wasAutoPaid = originalMessage.automaticAction ?? false;

    if (paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        return <ReportActionItemBasicMessage message={getElsewherePaymentReportActionMessage(translate, originalMessage)} />;
    }

    if (paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
        const last4Digits = originalMessage.accountNumber?.slice(-4) ?? getBankAccountLastFourDigits(originalMessage.bankAccountID, bankAccountList, policyACHAccountNumber);
        const crossBorderMessage = getCrossBorderReimbursedMessage(translate, originalMessage, convertToDisplayString, last4Digits);
        const paymentMessage = crossBorderMessage ?? translate(wasAutoPaid ? 'iou.automaticallyPaidWithBusinessBankAccount' : 'iou.businessBankAccount', '', last4Digits);
        const translation = getPaymentMessageWithExpectedDate(translate, dateFnsLocale, paymentMessage, expectedDate);
        if (wasAutoPaid) {
            return (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${translation}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        }
        return <ReportActionItemBasicMessage message={translation} />;
    }

    if (wasAutoPaid) {
        return (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyPaidWithExpensify')}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    }

    const amount = convertToDisplayString(Math.abs(originalMessage.amount ?? 0), originalMessage.currency);

    if (originalMessage.bankAccountID) {
        const bankAccount = bankAccountList?.[originalMessage.bankAccountID];
        return (
            <ReportActionItemBasicMessage
                message={translate(
                    originalMessage.payAsBusiness ? 'iou.settleInvoiceBusiness' : 'iou.settleInvoicePersonal',
                    amount,
                    bankAccount?.accountData?.accountNumber?.slice(-4) ?? '',
                )}
            />
        );
    }

    return <ReportActionItemBasicMessage message={translate('iou.paidWithExpensify')} />;
}

export default PaymentContent;
