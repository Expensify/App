import Table from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import type {ExpenseDefaultTableItem} from './WorkspaceExpenseDefaultsTableRow';

import WorkspaceExpenseDefaultsTableRow from './WorkspaceExpenseDefaultsTableRow';

type ExpenseDefaultsTableColumnKey = 'type' | 'condition' | 'rule' | 'actions';

type WorkspaceExpenseDefaultsTableProps = {
    rulesData: ExpenseDefaultTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

function WorkspaceExpenseDefaultsTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange}: WorkspaceExpenseDefaultsTableProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<ExpenseDefaultsTableColumnKey>> = [
        {
            key: 'type',
            label: translate('workspace.rules.expenseDefaultsTable.tableColumnType'),
            sortable: true,
            width: variables.tableTypeColumnWidth,
            styling: {containerStyles: [styles.justifyContentCenter]},
        },
        {
            key: 'condition',
            label: translate('workspace.rules.expenseDefaultsTable.tableColumnCondition'),
            sortable: true,
        },
        {
            key: 'rule',
            label: translate('workspace.rules.expenseDefaultsTable.tableColumnRule'),
            sortable: true,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareItems: CompareItemsCallback<ExpenseDefaultTableItem, ExpenseDefaultsTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (a.isMerchantType !== b.isMerchantType) {
            return a.isMerchantType ? 1 : -1;
        }

        if (activeSorting.columnKey === 'type') {
            const aVal = a.isRename ? 0 : 1;
            const bVal = b.isRename ? 0 : 1;
            const diff = aVal - bVal;
            if (diff !== 0) {
                return diff * orderMultiplier;
            }
            return localeCompare(a.conditionText, b.conditionText) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'condition') {
            return localeCompare(a.conditionText, b.conditionText) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'rule') {
            return localeCompare(a.ruleDescription, b.ruleDescription) * orderMultiplier;
        }

        return 0;
    };

    const isItemInSearch: IsItemInSearchCallback<ExpenseDefaultTableItem> = (item, searchString) => {
        const matchingItems = tokenizedSearch([item], searchString, (i) => i.searchTokens);
        return matchingItems.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<ExpenseDefaultTableItem>) => (
        <WorkspaceExpenseDefaultsTableRow
            key={item.ruleID}
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={rulesData}
            columns={columns}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            renderItem={renderItem}
            keyExtractor={(item) => item.keyForList}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="condition"
            narrowLayoutSortColumn="condition"
            title={translate('workspace.rules.tabs.expenseDefaults')}
        >
            <Table.FilterBar label={translate('workspace.rules.expenseDefaultsTable.findRule')} />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceExpenseDefaultsTable;
export type {ExpenseDefaultTableItem};
