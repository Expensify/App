/** Bill intake records creation and submission under the vendor or receiver rather than the person who created the bill. */
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isBillPayReport(report: OnyxEntry<Report>, isInvoiceLinkedToBill: boolean): boolean {
    return report?.type === CONST.REPORT.UNSUPPORTED_TYPE.BILL || (report?.type === CONST.REPORT.TYPE.INVOICE && isInvoiceLinkedToBill);
}

function isBillPayHistoryAction(action: OnyxEntry<ReportAction>, report: OnyxEntry<Report>, isInvoiceLinkedToBill: boolean): boolean {
    if (
        action?.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED &&
        action?.actionName !== CONST.REPORT.ACTIONS.TYPE.SUBMITTED &&
        action?.actionName !== CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED
    ) {
        return false;
    }
    return isBillPayReport(report, isInvoiceLinkedToBill);
}

// Bill Pay history replaces the stored creation and submission actors.
// Keep separate actor headers for these actions and the actions immediately before and after them.
function shouldKeepBillPayActorHeader(action: OnyxEntry<ReportAction>, previousAction: OnyxEntry<ReportAction>, report: OnyxEntry<Report>, isInvoiceLinkedToBill: boolean): boolean {
    return isBillPayHistoryAction(action, report, isInvoiceLinkedToBill) || isBillPayHistoryAction(previousAction, report, isInvoiceLinkedToBill);
}

export {isBillPayHistoryAction, isBillPayReport, shouldKeepBillPayActorHeader};
