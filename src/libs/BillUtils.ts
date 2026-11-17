import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report} from '@src/types/onyx';

/** Bills are the reports that receivers approve and pay for a vendor's invoice. */
function isBillReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

function isBillPayReport(report: OnyxInputOrEntry<Report>, accountID: number): boolean {
    if (!report || report.isHiddenForBillReceiver) {
        return false;
    }

    return isBillReport(report) || (report.type === CONST.REPORT.TYPE.INVOICE && (report.isBillPayReport ?? report.managerID === accountID));
}

/** Bills stay hidden from users without the newDotBillPay beta. */
function shouldHideBillReport(reportType: string | undefined, isBillPayBetaEnabled: boolean): boolean {
    return reportType === CONST.REPORT.TYPE.BILL && !isBillPayBetaEnabled;
}

export {isBillReport, isBillPayReport, shouldHideBillReport};
