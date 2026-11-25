/** Detects held expenses owned by the current user, rather than all held expenses they can approve. */
import {isCurrentUserSubmitter} from '@libs/ReportUtils';
import {isOnHold} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {accountIDSelector} from '@selectors/Session';
// Suggested-search visibility must use live data, not the currently displayed search snapshot.
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

const getHeldReportIDs = (transactions: OnyxCollection<Transaction>): string[] =>
    Object.values(transactions ?? {}).flatMap((transaction) => (transaction?.reportID && isOnHold(transaction) ? [transaction.reportID] : []));

const hasOwnHeldExpenseSelector =
    (accountID: number | undefined, heldReportIDs: string[]) =>
    (reports: OnyxCollection<Report>): boolean =>
        !!accountID && heldReportIDs.some((reportID) => isCurrentUserSubmitter(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`], accountID));

function useHasHeldExpense(): boolean {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    // The ownership join needs report IDs, not just a boolean. Avoid deep-comparing an array on every transaction write.
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const heldReportIDs = getHeldReportIDs(transactions);
    const [hasOwnHeldExpense = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasOwnHeldExpenseSelector(accountID, heldReportIDs)});
    return hasOwnHeldExpense;
}

export default useHasHeldExpense;
