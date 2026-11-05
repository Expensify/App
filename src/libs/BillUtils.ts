import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report} from '@src/types/onyx';

/** Bills are the reports that receivers approve and pay for a vendor's invoice. */
function isBillReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.type === CONST.REPORT.UNSUPPORTED_TYPE.BILL;
}

/** Bills stay hidden from users without the newDotBillPay beta. */
function shouldHideBillReport(reportType: string | undefined, isBillPayBetaEnabled: boolean): boolean {
    return reportType === CONST.REPORT.UNSUPPORTED_TYPE.BILL && !isBillPayBetaEnabled;
}

export {isBillReport, shouldHideBillReport};
