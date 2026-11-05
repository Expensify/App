import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report} from '@src/types/onyx';

/** Bills are the reports that receivers approve and pay for a vendor's invoice. */
function isBillReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.type === CONST.REPORT.UNSUPPORTED_TYPE.BILL;
}

export default isBillReport;
