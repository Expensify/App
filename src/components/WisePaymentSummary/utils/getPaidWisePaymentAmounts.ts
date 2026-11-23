import type {WisePaymentAmounts} from '@components/WisePaymentSummary/types';

import {getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** The final amounts of a Wise payment, which the backend adds to the pay action once Wise creates the transfer */
function getPaidWisePaymentAmounts(reportAction: OnyxInputOrEntry<ReportAction>): WisePaymentAmounts | undefined {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU)) {
        return undefined;
    }
    const originalMessage = getOriginalMessage(reportAction);
    if (originalMessage?.type !== CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        return undefined;
    }
    const {fee, rate, debitedAmount, creditedAmount, currency, creditedCurrency, tax} = originalMessage;
    if (fee === undefined || rate === undefined || debitedAmount === undefined || creditedAmount === undefined || !currency || !creditedCurrency) {
        return undefined;
    }
    return {fee, rate, debitedAmount, creditedAmount, currency, paymentCurrency: creditedCurrency, tax};
}

/** The report's latest Wise payment action, so a report paid again after a cancel shows the payment that stands */
function getLatestPaidWiseAction(reportActions: OnyxEntry<ReportActions>): ReportAction | undefined {
    let latest: ReportAction | undefined;
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (getPaidWisePaymentAmounts(reportAction) && (!latest || reportAction.created > latest.created)) {
            latest = reportAction;
        }
    }
    return latest;
}

function getLatestPaidWisePaymentAmounts(reportActions: OnyxEntry<ReportActions>): WisePaymentAmounts | undefined {
    return getPaidWisePaymentAmounts(getLatestPaidWiseAction(reportActions));
}

/** Only the latest payment counts, because the receipt of a canceled transfer is not the payment that stands */
function isLatestWiseReceiptAvailable(reportActions: OnyxEntry<ReportActions>): boolean {
    const reportAction = getLatestPaidWiseAction(reportActions);
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU)) {
        return false;
    }
    return !!getOriginalMessage(reportAction)?.isWiseReceiptAvailable;
}

export default getPaidWisePaymentAmounts;
export {getLatestPaidWisePaymentAmounts, isLatestWiseReceiptAvailable};
