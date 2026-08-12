import {useSearchSelectionContext} from '@components/Search/SearchContext';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';

import {getSections, isTransactionListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {SearchListItem, TransactionListItemType} from './types';

import useRegisterGroupChildrenForShiftRange from './useRegisterGroupChildrenForShiftRange';

type GetSectionsArgs = Parameters<typeof getSections>[0];

type UseGroupChildrenForShiftRangeArgs = {
    /** The group's original (un-prefixed) key, which children are registered under */
    groupKey: string;

    /** Whether this is the expense-report view, where the rows arrive ready to render */
    isExpenseReportType: boolean;

    /** The children source in expense-report views */
    groupTransactions: TransactionListItemType[];

    /** The children source in group-by views, loaded when the group opens */
    snapshotData: GetSectionsArgs['data'] | undefined;

    /** Needed to build the rows, and passed down rather than read again per group */
    bankAccountList: GetSectionsArgs['bankAccountList'];

    /** Needed to build the rows, and passed down rather than read again per group */
    cardFeeds: GetSectionsArgs['cardFeeds'];

    /** Needed to build the rows, and passed down rather than read again per group */
    conciergeReportID: GetSectionsArgs['conciergeReportID'];
};

function getSnapshotTransactionRows(snapshotData: GetSectionsArgs['data'] | undefined, args: Omit<GetSectionsArgs, 'data'>): TransactionListItemType[] {
    if (!snapshotData) {
        return [];
    }
    const [sectionData] = getSections({...args, data: snapshotData});
    // With type EXPENSE every row is a transaction. The guard narrows getSections' union return without a cast.
    const rows: SearchListItem[] = sectionData;
    return rows.filter(isTransactionListItemType);
}

/**
 * One source for a group's children across both grouped render paths: derives them, publishes them for shift+click,
 * and returns them stamped with the live selection.
 */
function useGroupChildrenForShiftRange({groupKey, isExpenseReportType, groupTransactions, snapshotData, bankAccountList, cardFeeds, conciergeReportID}: UseGroupChildrenForShiftRangeArgs): {
    transactions: TransactionListItemType[];
    isGroupSelected: boolean;
} {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const {convertToDisplayString} = useCurrencyListActions();
    const {selectedTransactions} = useSearchSelectionContext();

    // Selection-independent on purpose: folding isSelected in would churn the registered children on every selection change.
    const rangeChildren: TransactionListItemType[] = isExpenseReportType
        ? groupTransactions
        : getSnapshotTransactionRows(snapshotData, {
              dateFnsLocale,
              type: CONST.SEARCH.DATA_TYPES.EXPENSE,
              currentAccountID: currentUserDetails.accountID,
              currentUserEmail: currentUserDetails.email ?? '',
              translate,
              formatPhoneNumber,
              bankAccountList,
              isActionLoadingSet,
              cardFeeds,
              conciergeReportID,
              convertToDisplayString,
              reportAttributesDerivedValue: undefined,
          });

    useRegisterGroupChildrenForShiftRange(groupKey, rangeChildren, !isExpenseReportType);

    const selectedTransactionIDsSet = new Set(Object.keys(selectedTransactions));

    // A group selected before its children were fetched is stored under the group key, since no transaction IDs were known yet.
    const isGroupSelected = !!selectedTransactions[groupKey]?.isSelected;

    // Stamp the live selection and the parent key onto each row, which is how a row checks whether its group was excluded. Expense-report rows carry both already.
    const transactions: TransactionListItemType[] = isExpenseReportType
        ? rangeChildren
        : rangeChildren.map((transactionItem) => ({
              ...transactionItem,
              isSelected: isGroupSelected || selectedTransactionIDsSet.has(transactionItem.transactionID),
              selectionGroupKey: groupKey,
          }));

    return {transactions, isGroupSelected};
}

export default useGroupChildrenForShiftRange;
