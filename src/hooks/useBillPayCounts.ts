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
        if (!report || !isBillPayReport(report, accountID)) {
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
