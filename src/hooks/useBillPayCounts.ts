/** Derives Bills navigation from the same reports used by the Inbox. */
import type {BillPayCounts} from '@libs/BillPayUtils';
import {getBillPayCounts} from '@libs/BillPayUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {sessionEmailAndAccountIDSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

const NO_BILLS: BillPayCounts = {hasBills: false, billsApprove: 0, billsPay: 0};

function useBillPayCounts(): BillPayCounts {
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const email = session?.email ?? '';

    // The selector reduces every report to three counts, so the hook re-renders only when a count changes
    const [counts = NO_BILLS] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => getBillPayCounts(reports, policies, accountID, email)});
    return counts;
}

export default useBillPayCounts;
