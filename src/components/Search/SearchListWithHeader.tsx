import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import type {BaseSelectionListProps, ReportListItemType, SelectionListHandle, TransactionListItemType} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {SearchDataTypes, SearchQuery, SearchReport} from '@src/types/onyx/SearchResults';
import SearchPageHeader from './SearchPageHeader';
import type {SelectedTransactionInfo, SelectedTransactions} from './types';

type SearchListWithHeaderProps = Omit<BaseSelectionListProps<ReportListItemType | TransactionListItemType>, 'onSelectAll' | 'onCheckboxPress' | 'sections'> & {
    query: SearchQuery;
    hash: number;
    data: TransactionListItemType[] | ReportListItemType[];
    searchType: SearchDataTypes;
};

function mapTransactionItemToSelectedEntry(item: TransactionListItemType): [string, SelectedTransactionInfo] {
    return [item.keyForList, {isSelected: true, canDelete: item.canDelete, canHold: item.canHold, canUnhold: item.canUnhold, action: item.action}];
}

function mapToTransactionItemWithSelectionInfo(item: TransactionListItemType, selectedTransactions: SelectedTransactions) {
    return {...item, isSelected: !!selectedTransactions[item.keyForList]?.isSelected};
}

function mapToItemWithSelectionInfo(item: TransactionListItemType | ReportListItemType, selectedTransactions: SelectedTransactions) {
    return SearchUtils.isTransactionListItemType(item)
        ? mapToTransactionItemWithSelectionInfo(item, selectedTransactions)
        : {
              ...item,
              transactions: item.transactions?.map((transaction) => mapToTransactionItemWithSelectionInfo(transaction, selectedTransactions)),
              isSelected: item.transactions.every((transaction) => !!selectedTransactions[transaction.keyForList]?.isSelected),
          };
}

function SearchListWithHeader({ListItem, onSelectRow, query, hash, data, searchType, ...props}: SearchListWithHeaderProps, ref: ForwardedRef<SelectionListHandle>) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [selectedTransactions, setSelectedTransactions] = useState<SelectedTransactions>({});
    const [selectedTransactionsToDelete, setSelectedTransactionsToDelete] = useState<string[]>([]);
    const [deleteExpensesConfirmModalVisible, setDeleteExpensesConfirmModalVisible] = useState(false);
    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);

    const selectedReports: Array<SearchReport['reportID']> = useMemo(() => {
        if (searchType !== CONST.SEARCH.DATA_TYPES.REPORT) {
            return [];
        }

        return data
            .filter(
                (item) => !SearchUtils.isTransactionListItemType(item) && item.reportID && item.transactions.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected),
            )
            .map((item) => item.reportID);
    }, [selectedTransactions, data, searchType]);

    const handleOnSelectDeleteOption = (itemsToDelete: string[]) => {
        setSelectedTransactionsToDelete(itemsToDelete);
        setDeleteExpensesConfirmModalVisible(true);
    };

    const handleOnCancelConfirmModal = () => {
        setSelectedTransactionsToDelete([]);
        setDeleteExpensesConfirmModalVisible(false);
    };

    const clearSelectedItems = () => setSelectedTransactions({});

    const handleDeleteExpenses = () => {
        if (selectedTransactionsToDelete.length === 0) {
            return;
        }

        clearSelectedItems();
        setDeleteExpensesConfirmModalVisible(false);
        SearchActions.deleteMoneyRequestOnSearch(hash, selectedTransactionsToDelete);
    };

    useEffect(() => {
        clearSelectedItems();
    }, [hash]);

    const toggleTransaction = useCallback(
        (item: TransactionListItemType | ReportListItemType) => {
            if (SearchUtils.isTransactionListItemType(item)) {
                if (!item.keyForList) {
                    return;
                }

                setSelectedTransactions((prev) => {
                    if (prev[item.keyForList]?.isSelected) {
                        const {[item.keyForList]: omittedTransaction, ...transactions} = prev;
                        return transactions;
                    }
                    return {...prev, [item.keyForList]: {isSelected: true, canDelete: item.canDelete, canHold: item.canHold, canUnhold: item.canUnhold, action: item.action}};
                });

                return;
            }

            if (item.transactions.every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};

                item.transactions.forEach((transaction) => {
                    delete reducedSelectedTransactions[transaction.keyForList];
                });

                setSelectedTransactions(reducedSelectedTransactions);
                return;
            }

            setSelectedTransactions({
                ...selectedTransactions,
                ...Object.fromEntries(item.transactions.map(mapTransactionItemToSelectedEntry)),
            });
        },
        [selectedTransactions],
    );

    const toggleAllTransactions = () => {
        const areItemsOfReportType = searchType === CONST.SEARCH.DATA_TYPES.REPORT;
        const flattenedItems = areItemsOfReportType ? (data as ReportListItemType[]).flatMap((item) => item.transactions) : data;
        const isAllSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        if (isAllSelected) {
            clearSelectedItems();
            return;
        }

        if (areItemsOfReportType) {
            setSelectedTransactions(Object.fromEntries((data as ReportListItemType[]).flatMap((item) => item.transactions.map(mapTransactionItemToSelectedEntry))));

            return;
        }

        setSelectedTransactions(Object.fromEntries((data as TransactionListItemType[]).map(mapTransactionItemToSelectedEntry)));
    };

    const sortedSelectedData = useMemo(() => data.map((item) => mapToItemWithSelectionInfo(item, selectedTransactions)), [data, selectedTransactions]);

    return (
        <>
            <SearchPageHeader
                selectedTransactions={selectedTransactions}
                clearSelectedItems={clearSelectedItems}
                query={query}
                hash={hash}
                onSelectDeleteOption={handleOnSelectDeleteOption}
                selectedReports={selectedReports}
                setOfflineModalOpen={() => setOfflineModalVisible(true)}
                setDownloadErrorModalOpen={() => setDownloadErrorModalVisible(true)}
            />
            <SelectionListWithModal<ReportListItemType | TransactionListItemType>
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                sections={[{data: sortedSelectedData, isDisabled: false}]}
                ListItem={ListItem}
                onSelectRow={onSelectRow}
                turnOnSelectionModeOnLongPress
                onTurnOnSelectionMode={(item) => item && toggleTransaction(item)}
                ref={ref}
                onCheckboxPress={toggleTransaction}
                onSelectAll={toggleAllTransactions}
            />
            <ConfirmModal
                isVisible={deleteExpensesConfirmModalVisible}
                onConfirm={handleDeleteExpenses}
                onCancel={handleOnCancelConfirmModal}
                title={translate('iou.deleteExpense', {count: selectedTransactionsToDelete.length})}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsToDelete.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('search.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
        </>
    );
}

SearchListWithHeader.displayName = 'SearchListWithHeader';

export default forwardRef(SearchListWithHeader);
