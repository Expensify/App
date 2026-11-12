import {isPolicyEligibleForSpendOverTime} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// Direct access to useOnyx, so this reads live report data rather than whatever search snapshot is loaded.
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

/**
 * Whether the user sees anybody else's expenses.
 *
 * Navigation uses this to decide whether splitting a group into "all" and "mine" says anything: for someone who
 * only ever sees their own spend, the two searches return the same rows, so the group collapses to one entry.
 *
 * A workspace role answers this on its own, since an admin, auditor or approver sees what the workspace spends
 * whether or not any of it has loaded yet. The reports are checked too, for someone who holds no such role but
 * can still see a report of somebody else's. That check reads what Onyx currently holds, so it can start false
 * and turn true as reports load. Either direction only ever adds the entry rather than taking it away.
 */
function useHasOthersExpenses(): boolean {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserAccountID = session?.accountID;

    if (!currentUserAccountID) {
        return false;
    }

    const canSeeWorkspaceSpend = Object.values(allPolicies ?? {}).some((policy) => !!policy && isPolicyEligibleForSpendOverTime(policy, session?.email));
    if (canSeeWorkspaceSpend) {
        return true;
    }

    return Object.values(allReports ?? {}).some((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && !!report.ownerAccountID && report.ownerAccountID !== currentUserAccountID);
}

export default useHasOthersExpenses;
