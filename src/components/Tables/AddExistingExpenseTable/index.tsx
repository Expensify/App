import type {CompareItemsCallback, FilterConfig, IsItemInFilterCallback, IsItemInSearchCallback, TableColumn, TableData, TableProps} from '@components/Table';
import Table from '@components/Table';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import tokenizedSearch from '@libs/tokenizedSearch';
import {getAmount, getCreated, getCurrency, getDescription, getMerchant, isUnreportedTransaction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import AddExistingExpenseTableRow from './AddExistingExpenseTableRow';

type ExpenseTableColumnKey = 'date' | 'amount';
type ExpenseTableFilterKey = 'status';
type UnreportedExpenseTableRowData = Transaction & TableData;

type AddExistingExpenseTableProps = Pick<
    TableProps<UnreportedExpenseTableRowData, ExpenseTableColumnKey, ExpenseTableFilterKey>,
    'onEndReached' | 'onEndReachedThreshold' | 'ListFooterComponent'
> & {
    data: UnreportedExpenseTableRowData[];
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

function AddExistingExpenseTable({data, selectedKeys, onRowSelectionChange, onEndReached, onEndReachedThreshold, ListFooterComponent}: AddExistingExpenseTableProps) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const columns: Array<TableColumn<ExpenseTableColumnKey>> = [
        {key: 'date', label: translate('common.date'), sortable: true},
        {key: 'amount', label: translate('iou.amount'), sortable: true},
    ];

    const filters: FilterConfig<ExpenseTableFilterKey> = {
        status: {
            label: translate('common.status'),
            filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
            options: [
                {label: translate('common.unreported'), value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED},
                {label: translate('common.draft'), value: CONST.SEARCH.STATUS.EXPENSE.DRAFTS},
            ],
        },
    };

    const isItemInFilter: IsItemInFilterCallback<UnreportedExpenseTableRowData> = (item, values) => {
        if (values.length === 0) {
            return true;
        }

        const includesUnreported = values.includes(CONST.SEARCH.STATUS.EXPENSE.UNREPORTED);
        const includesDrafts = values.includes(CONST.SEARCH.STATUS.EXPENSE.DRAFTS);
        const isUnreported = isUnreportedTransaction(item);

        if (includesUnreported && isUnreported) {
            return true;
        }
        return includesDrafts && !isUnreported;
    };

    const isItemInSearch: IsItemInSearchCallback<UnreportedExpenseTableRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (transaction) => {
            const searchableFields: string[] = [];

            const merchant = getMerchant(transaction);
            if (merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchant !== CONST.TRANSACTION.DEFAULT_MERCHANT) {
                searchableFields.push(merchant);
            }

            const description = getDescription(transaction);
            if (description.trim()) {
                searchableFields.push(description);
            }

            const amount = getAmount(transaction);
            const currency = getCurrency(transaction);
            const formattedAmount = convertToDisplayString(amount, currency);
            searchableFields.push(formattedAmount);

            // This allows users to search "2000" and find "$2,000.00" for example
            const normalizedAmount = (amount / 100).toString();
            searchableFields.push(normalizedAmount);

            return searchableFields;
        });

        return results.length > 0;
    };

    const compareItems: CompareItemsCallback<UnreportedExpenseTableRowData, ExpenseTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'desc' ? -1 : 1;

        if (activeSorting.columnKey === 'amount') {
            return (getAmount(item1) - getAmount(item2)) * orderMultiplier;
        }

        // Default: sort by the expense date, matching how Spend > Expenses orders rows by default.
        const created1 = new Date(getCreated(item1)).getTime();
        const created2 = new Date(getCreated(item2)).getTime();
        return (created1 - created2) * orderMultiplier;
    };

    const renderExpenseTableRow = ({item, index}: ListRenderItemInfo<UnreportedExpenseTableRowData>) => (
        <AddExistingExpenseTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout
        />
    );

    return (
        <Table<UnreportedExpenseTableRowData, ExpenseTableColumnKey, ExpenseTableFilterKey>
            data={data}
            title={translate('common.expenses')}
            columns={columns}
            selectionEnabled
            shouldEnableSelectionInNarrowPaneModal
            // Expenses are confirmed in one batch, so narrowing the list to find the next one must not drop what is already picked.
            shouldPreserveSelectionOnSearch
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            initialSortColumn="date"
            initialSortOrder="desc"
            compareItems={compareItems}
            filters={filters}
            isItemInFilter={isItemInFilter}
            isItemInSearch={isItemInSearch}
            renderItem={renderExpenseTableRow}
            keyExtractor={(item) => item.keyForList}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            maintainVisibleContentPosition={{disabled: true}}
            ListFooterComponent={ListFooterComponent}
        >
            <Table.ListHeader>
                <Table.FilterBar label={translate('iou.findExpense')} />
            </Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default AddExistingExpenseTable;
export type {UnreportedExpenseTableRowData};
