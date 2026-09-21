import RenderHTML from '@components/RenderHTML';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import DateUtils from '@libs/DateUtils';
import getBankAccountLastFourDigits from '@libs/getBankAccountLastFourDigits';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getCrossBorderReimbursedMessage, getElsewherePaymentReportActionMessage, getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {policyACHAccountNumberSelector} from '@selectors/Policy';
import React from 'react';

type PaymentContentProps = {
    action: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
    policyID: string | undefined;
    reportID: string | undefined;
};

function PaymentContent({action, policyID, reportID}: PaymentContentProps) {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policyACHAccountNumber] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyACHAccountNumberSelector});
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const originalMessage = getOriginalMessage(action);
    const reimbursedExpectedDateSelector = (reportActions: OnyxEntry<OnyxTypes.ReportActions>) => {
        let latestReimbursedAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSED> | undefined;
        for (const reportAction of Object.values(reportActions ?? {})) {
            if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED) || reportAction.created > action.created) {
                continue;
            }
            if (!latestReimbursedAction || reportAction.created > latestReimbursedAction.created) {
                latestReimbursedAction = reportAction;
            }
        }
        return getOriginalMessage(latestReimbursedAction)?.expectedDate;
    };
    const [reimbursedExpectedDate] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`, {selector: reimbursedExpectedDateSelector});

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
        const expectedDate = originalMessage.expectedDate ?? reimbursedExpectedDate;
        const formattedExpectedDate = expectedDate ? DateUtils.formatWithUTCTimeZone(expectedDate, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, dateFnsLocale) : undefined;
        const expectedDateMessage = formattedExpectedDate
            ? translate('nextStep.message.waitingForPayment', '', CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN, formattedExpectedDate, CONST.NEXT_STEP.ETA_TYPE.DATE_TIME)
            : undefined;
        const paymentMessage = crossBorderMessage ?? translate(wasAutoPaid ? 'iou.automaticallyPaidWithBusinessBankAccount' : 'iou.businessBankAccount', '', last4Digits);
        const translation = expectedDateMessage ? translate('iou.paymentWithExpectedDate', {paymentMessage, expectedDateMessage}) : paymentMessage;
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
