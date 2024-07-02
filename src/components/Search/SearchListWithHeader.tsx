import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useMemo, useState} from 'react';
import SelectionList from '@components/SelectionList';
import type {BaseSelectionListProps, ReportListItemType, SelectionListHandle, TransactionListItemType} from '@components/SelectionList/types';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {SearchDataTypes, SearchQuery} from '@src/types/onyx/SearchResults';
import SearchPageHeader from './SearchPageHeader';
import type {SelectedTransactionInfo, SelectedTransactions} from './types';

type SearchListWithHeaderProps = Omit<BaseSelectionListProps<ReportListItemType | TransactionListItemType>, 'onSelectAll' | 'onCheckboxPress' | 'sections'> & {
    query: SearchQuery;
    hash: number;
    data: TransactionListItemType[] | ReportListItemType[];
    searchType: SearchDataTypes;
};

function mapTransactionItemToSelectedEntry(item: TransactionListItemType): [string, SelectedTransactionInfo] {
    return [item.keyForList, {isSelected: true, canDelete: item.canDelete, action: item.action}];
}

function mapToTransactionItemWithSelectionInfo(item: TransactionListItemType, selectedItems: SelectedTransactions) {
    return {...item, isSelected: !!selectedItems[item.keyForList]?.isSelected};
}

function mapToItemWithSelectionInfo(item: TransactionListItemType | ReportListItemType, selectedItems: SelectedTransactions) {
    return SearchUtils.isTransactionListItemType(item)
        ? mapToTransactionItemWithSelectionInfo(item, selectedItems)
        : {
              ...item,
              transactions: item.transactions?.map((tranaction) => mapToTransactionItemWithSelectionInfo(tranaction, selectedItems)),
              isSelected: item.transactions.every((transaction) => !!selectedItems[transaction.keyForList]?.isSelected),
          };
}

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
            ...Object.fromEntries(item.transactions.map(mapTransactionItemToSelectedEntry)),
        });
    };

    const toggleAllTransactions = () => {
        const areItemsOfReportType = searchType === CONST.SEARCH.DATA_TYPES.REPORT;
        const flattenedItems = areItemsOfReportType ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
        const isAllSelected = flattenedItems.length === Object.keys(selectedItems).length;

        if (isAllSelected) {
            clearSelectedItems();
            return;
        }

        if (areItemsOfReportType) {
            setSelectedItems(Object.fromEntries((data as ReportListItemType[]).flatMap((item) => item.transactions.map(mapTransactionItemToSelectedEntry))));

            return;
        }

        setSelectedItems(Object.fromEntries((data as TransactionListItemType[]).map(mapTransactionItemToSelectedEntry)));
    };

    const sortedSelectedData = useMemo(() => data.map((item) => mapToItemWithSelectionInfo(item, selectedItems)), [data, selectedItems]);

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
