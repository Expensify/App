import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import PersonalExpenseRulesTableRow from './PersonalExpenseRulesTableRow';

type PersonalExpenseRulesTableColumnKey = 'merchant' | 'changes' | 'actions';

type PersonalExpenseRuleRowData = TableData & {
    merchant: string;
    changes: string;
    pendingAction?: PendingAction;
    errors?: Errors;
    dismissError: () => void;
    action: () => void;
};

type PersonalExpenseRulesTableProps = {
    EmptyStateComponent: React.ReactElement;
    headerComponent?: React.ReactElement;
    personalExpenseRules: PersonalExpenseRuleRowData[];
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function PersonalExpenseRulesTable({EmptyStateComponent, headerComponent, personalExpenseRules, selectedKeys, onRowSelectionChange}: PersonalExpenseRulesTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

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

    const renderPersonalExpenseRuleItem = ({item, index}: ListRenderItemInfo<PersonalExpenseRuleRowData>) => (
        <PersonalExpenseRulesTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowLayout || isMediumScreenWidth}
        />
    );

    const searchBarComponent = personalExpenseRules.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? <Table.SearchBar label={translate('expenseRulesPage.findRule')} /> : undefined;
    const tableHeaderComponent =
        headerComponent || searchBarComponent ? (
            <>
                {headerComponent}
                {searchBarComponent}
            </>
        ) : undefined;

    return (
        <Table
            selectionEnabled
            title={translate('expenseRulesPage.title')}
            initialSortColumn="merchant"
            data={personalExpenseRules}
            selectedKeys={selectedKeys}
            columns={personalExpenseRulesTableColumns}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            renderItem={renderPersonalExpenseRuleItem}
            onRowSelectionChange={onRowSelectionChange}
            keyExtractor={(rule) => rule.keyForList}
            headerComponent={tableHeaderComponent}
            shouldUseStickyColumnHeader
            ListEmptyComponent={EmptyStateComponent}
        >
            <Table.Body />
        </Table>
    );
}

export type {PersonalExpenseRuleRowData, PersonalExpenseRulesTableColumnKey};
