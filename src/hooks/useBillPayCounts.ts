/** Derives Bills navigation and counters from the same reports used by the Inbox. */
import {canApproveBill, canPayBill, isBillPayReport} from '@libs/BillPayUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function useBillPayCounts() {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    let hasBills = false;
    let billsApprove = 0;
    let billsPay = 0;
    for (const report of Object.values(reports ?? {})) {
        // TODO: POC only. The backend's isBillPayReport flag isn't live yet, so any invoice counts as a bill and the
        // Bills nav group shows. Restore `isBillPayReport(report, accountID)` on its own before merging.
        if (!report || (!isBillPayReport(report, accountID) && report.type !== CONST.REPORT.TYPE.INVOICE)) {
            continue;
        }
        hasBills = true;
        if (canApproveBill(report, accountID)) {
            billsApprove++;
        }
        if (canPayBill(report, policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`], accountID, session?.email ?? '')) {
            billsPay++;
        }
    }
    return {hasBills, billsApprove, billsPay};
}

export default useBillPayCounts;
