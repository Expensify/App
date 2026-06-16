import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type PersonalExpenseRulesTableColumnKey = 'merchant' | 'changes' | 'actions';

type PersonalExpenseRuleRowData = TableData & {
    merchant: string;
    changes: string;
    pendingAction: PendingAction;
    errors: Errors;
};

type PersonalExpenseRulesTableProps = {
    personalExpenseRules: PersonalExpenseRuleRowData[];
};

export default function PersonalExpenseRulesTable({personalExpenseRules}: PersonalExpenseRulesTableProps) {
    const {translate, localeCompare} = useLocalize();

    const personalExpenseRulesTableColumns: Array<TableColumn<PersonalExpenseRulesTableColumnKey>> = [
        {
            key: 'merchant',
            label: translate('common.merchant'),
            sortable: true,
        },
        {
            key: 'changes',
            label: translate('common.change'),
            sortable: true,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareItems: CompareItemsCallback<PersonalExpenseRuleRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'changes') {
            return localeCompare(item1.changes, item2.changes) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'merchant') {
            return localeCompare(item1.merchant, item2.merchant) * orderMultiplier;
        }

        return localeCompare(item1.merchant, item2.merchant) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<PersonalExpenseRuleRowData> = (item, searchValue) => {
        const searchLower = searchValue.toLowerCase();
        const results = tokenizedSearch([item], searchLower, (option) => [option.merchant, option.changes]);
        return results.length > 0;
    };

    return (
        <Table
            selectionEnabled
            data={personalExpenseRules}
            columns={personalExpenseRulesTableColumns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="merchant"
            keyExtractor={(rule) => rule.keyForList}
        >
            <Table.Header />
            <Table.Body />
        </Table>
    );
}
