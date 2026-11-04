/** Bill intake uses the submission actions of a bill and its invoice to record who created them and who received them. */
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isBillPaySubmittedAction(action: OnyxEntry<ReportAction>, report: OnyxEntry<Report>, isInvoiceLinkedToBill: boolean): boolean {
    if (action?.actionName !== CONST.REPORT.ACTIONS.TYPE.SUBMITTED && action?.actionName !== CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) {
        return false;
    }
    return report?.type === CONST.REPORT.UNSUPPORTED_TYPE.BILL || (report?.type === CONST.REPORT.TYPE.INVOICE && isInvoiceLinkedToBill);
}

export default isBillPaySubmittedAction;
