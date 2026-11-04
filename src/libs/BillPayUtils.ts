/** Helpers for bills, the reports that receivers approve and pay for a vendor's invoice. */
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

function isBillReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

export {isBillReport};
