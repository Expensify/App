import {useSearchSelectionContext} from '@components/Search/SearchContext';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';

import {getSections, isTransactionListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import {useMemo} from 'react';

import type {SearchListItem, TransactionListItemType} from './types';

import useRegisterGroupChildrenForShiftRange from './useRegisterGroupChildrenForShiftRange';

type GetSectionsArgs = Parameters<typeof getSections>[0];

type UseGroupChildrenForShiftRangeArgs = {
    /** The group's original (un-prefixed) key — what the shift-range source looks children up by */
    groupKey: string;
    isExpanded: boolean;
    isExpenseReportType: boolean;
    /** The group's eager transactions — the children source in expense-report views */
    groupTransactions: TransactionListItemType[];
    /** The group's lazily-loaded snapshot data — the children source in group-by views */
    snapshotData: GetSectionsArgs['data'] | undefined;
    bankAccountList: GetSectionsArgs['bankAccountList'];
    cardFeeds: GetSectionsArgs['cardFeeds'];
    conciergeReportID: GetSectionsArgs['conciergeReportID'];
};

/**
 * Single source for a group's children in both grouped render paths (split `GroupChildrenContent`, inline `TransactionGroupListItem`):
 * derives them, registers them for shift-range, and returns the `isSelected`-stamped render projection alongside the raw list.
 */
function useGroupChildrenForShiftRange({
    groupKey,
    isExpanded,
    isExpenseReportType,
    groupTransactions,
    snapshotData,
    bankAccountList,
    cardFeeds,
    conciergeReportID,
}: UseGroupChildrenForShiftRangeArgs): {
    rangeChildren: TransactionListItemType[];
    transactions: TransactionListItemType[];
} {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {translate, formatPhoneNumber} = useLocalize();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const {convertToDisplayString} = useCurrencyListActions();
    const {selectedTransactions} = useSearchSelectionContext();

    // Selection-independent on purpose (don't fold isSelected in) so the registered shift-range source stays stable across selection changes.
    const rangeChildren: TransactionListItemType[] = useMemo(() => {
        if (isExpenseReportType) {
            return groupTransactions;
        }
        if (!snapshotData) {
            return [];
        }
        const [sectionData] = getSections({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            data: snapshotData,
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
        // With type EXPENSE every row is a transaction; the guard narrows getSections' union return without an unsafe cast.
        const rows: SearchListItem[] = sectionData;
        return rows.filter(isTransactionListItemType);
    }, [
        isExpenseReportType,
        groupTransactions,
        snapshotData,
        currentUserDetails.accountID,
        currentUserDetails.email,
        translate,
        formatPhoneNumber,
        bankAccountList,
        isActionLoadingSet,
        cardFeeds,
        conciergeReportID,
        convertToDisplayString,
    ]);

    useRegisterGroupChildrenForShiftRange(groupKey, rangeChildren, !isExpenseReportType && isExpanded);

    const selectedTransactionIDsSet = useMemo(() => new Set(Object.keys(selectedTransactions)), [selectedTransactions]);

    // Render projection: stamp live selection onto each row for the checkbox visual. Expense-report rows already carry it upstream.
    const transactions: TransactionListItemType[] = useMemo(
        () =>
            isExpenseReportType ? rangeChildren : rangeChildren.map((transactionItem) => ({...transactionItem, isSelected: selectedTransactionIDsSet.has(transactionItem.transactionID)})),
        [isExpenseReportType, rangeChildren, selectedTransactionIDsSet],
    );

    return {rangeChildren, transactions};
}

export default useGroupChildrenForShiftRange;
