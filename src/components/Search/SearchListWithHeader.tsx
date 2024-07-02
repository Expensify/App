import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useState} from 'react';
import SelectionList from '@components/SelectionList';
import type {BaseSelectionListProps, ReportListItemType, SelectionListHandle, TransactionListItemType} from '@components/SelectionList/types';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {SearchDataTypes, SearchQuery} from '@src/types/onyx/SearchResults';
import SearchPageHeader from './SearchPageHeader';
import type {SelectedTransactions} from './types';

type SearchListWithHeaderProps = Omit<BaseSelectionListProps<ReportListItemType | TransactionListItemType>, 'onSelectAll' | 'onCheckboxPress' | 'sections'> & {
    query: SearchQuery;
    hash: number;
    data: TransactionListItemType[] | ReportListItemType[];
    searchType: SearchDataTypes;
};

function SearchListWithHeader({ListItem, onSelectRow, query, hash, data, searchType, ...props}: SearchListWithHeaderProps, ref: ForwardedRef<SelectionListHandle>) {
    const [selectedItems, setSelectedItems] = useState<SelectedTransactions>({});

    const clearSelectedItems = () => setSelectedItems({});

    useEffect(() => {
        clearSelectedItems();
    }, [hash]);

    const toggleTransaction = (item: TransactionListItemType | ReportListItemType) => {
        if (SearchUtils.isTransactionListItemType(item)) {
            if (!item.keyForList) {
                return;
            }

            setSelectedItems((prev) => {
                if (prev[item.keyForList]?.isSelected) {
                    const {[item.keyForList]: omittedTransaction, ...transactions} = prev;
                    return transactions;
                }
                return {...prev, [item.keyForList]: {isSelected: true, canDelete: item.canDelete, action: item.action}};
            });

            return;
        }

        if (item.transactions.every((transaction) => selectedItems[transaction.keyForList]?.isSelected)) {
            const reducedSelectedItems: SelectedTransactions = {...selectedItems};

            item.transactions.forEach((transaction) => {
                delete reducedSelectedItems[transaction.keyForList];
            });

            setSelectedItems(reducedSelectedItems);
            return;
        }

        setSelectedItems({
            ...selectedItems,
            ...Object.fromEntries(item.transactions.map((transaction) => [transaction.keyForList, {isSelected: true, canDelete: transaction.canDelete, action: transaction.action}])),
        });
    };

    const toggleAllTransactions = () => {
        const areReportItems = searchType === CONST.SEARCH.DATA_TYPES.REPORT;
        const flattenedItems = areReportItems ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
        const isAllSelected = flattenedItems.length === Object.keys(selectedItems).length;

        if (isAllSelected) {
            clearSelectedItems();
            return;
        }

        if (areReportItems) {
            setSelectedItems(
                Object.fromEntries(
                    (data as ReportListItemType[]).flatMap((item) =>
                        item.transactions.map((transaction: TransactionListItemType) => [
                            transaction.keyForList,
                            {isSelected: true, canDelete: transaction.canDelete, action: transaction.action},
                        ]),
                    ),
                ),
            );

            return;
        }

        setSelectedItems(Object.fromEntries((data as TransactionListItemType[]).map((item) => [item.keyForList, {isSelected: true, canDelete: item.canDelete, action: item.action}])));
    };

    const mapToSelectedTransactionItem = useCallback((item: TransactionListItemType) => ({...item, isSelected: !!selectedItems[item.keyForList]?.isSelected}), [selectedItems]);

    const sortedSelectedData = useMemo(
        () =>
            data.map((item) =>
                SearchUtils.isTransactionListItemType(item)
                    ? mapToSelectedTransactionItem(item)
                    : {
                          ...item,
                          transactions: item.transactions?.map(mapToSelectedTransactionItem),
                          isSelected: item.transactions.every((transaction) => !!selectedItems[transaction.keyForList]?.isSelected),
                      },
            ),
        [data, mapToSelectedTransactionItem, selectedItems],
    );

    return (
        <>
            <SearchPageHeader
                selectedItems={selectedItems}
                clearSelectedItems={clearSelectedItems}
                query={query}
                hash={hash}
            />
            <SelectionList<ReportListItemType | TransactionListItemType>
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                sections={[{data: sortedSelectedData, isDisabled: false}]}
                ListItem={ListItem}
                onSelectRow={onSelectRow}
                ref={ref}
                onCheckboxPress={toggleTransaction}
                onSelectAll={toggleAllTransactions}
            />
        </>
    );
}

SearchListWithHeader.displayName = 'SearchListWithHeader';

export default forwardRef(SearchListWithHeader);
