/** Shared rules for who can approve bills. */
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isBillReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

function canApproveBill(report: OnyxEntry<Report>, accountID: number): boolean {
    return isBillReport(report) && report?.managerID === accountID && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

export {isBillReport, canApproveBill};
