import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// Direct access to useOnyx, so this reads live report data rather than whatever search snapshot is loaded.
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

/**
 * Whether any expense report the user can see belongs to somebody else.
 *
 * Navigation uses this to decide whether splitting a group into "all" and "mine" says anything: for someone who
 * only ever sees their own spend, the two searches return the same rows, so the group collapses to one entry.
 *
 * This reads what Onyx currently holds, so it can start false and turn true as reports load. That direction is
 * harmless — the nav gains an entry rather than losing one out from under the user.
 */
function useHasOthersExpenses(): boolean {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserAccountID = session?.accountID;

    if (!currentUserAccountID) {
        return false;
    }

    return Object.values(allReports ?? {}).some((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && !!report.ownerAccountID && report.ownerAccountID !== currentUserAccountID);
}

export default useHasOthersExpenses;
