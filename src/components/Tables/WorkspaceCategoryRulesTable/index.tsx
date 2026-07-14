import Table from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableRenderRowProps} from '@components/Table';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

type CategoryRulesTableColumnKey = 'type' | 'condition' | 'rule' | 'actions';

type CategoryRulesTableItem = TableData & {
    ruleID: string;
    typeLabel: string;
    conditionText: string;
    ruleDescription: string;
    searchTokens: string[];
};

type WorkspaceCategoryRulesTableProps<TItem extends CategoryRulesTableItem> = {
    rulesData: TItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    emptyStateContent?: React.ReactElement;
    tableTitle: string;
    findRuleLabel: string;
    typeColumnLabel: string;
    conditionColumnLabel: string;
    ruleColumnLabel: string;
    emptyState: TableEmptyStateProps;
    renderRow: (props: TableRenderRowProps<TItem>) => React.ReactElement;
};

function WorkspaceCategoryRulesTable<TItem extends CategoryRulesTableItem>({
    rulesData,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    tableTitle,
    findRuleLabel,
    typeColumnLabel,
    conditionColumnLabel,
    ruleColumnLabel,
    emptyState,
    renderRow,
}: WorkspaceCategoryRulesTableProps<TItem>) {
    const {localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<CategoryRulesTableColumnKey>> = [
        {
            key: 'type',
            label: typeColumnLabel,
            sortable: true,
            width: variables.tableTypeColumnWidth,
            styling: {containerStyles: [styles.justifyContentCenter]},
        },
        {key: 'condition', label: conditionColumnLabel, sortable: true},
        {key: 'rule', label: ruleColumnLabel, sortable: true},
        {key: 'actions', label: '', sortable: false, width: variables.tableCaretColumnWidth},
    ];

    const compareItems: CompareItemsCallback<TItem, CategoryRulesTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'type') {
            return localeCompare(a.typeLabel, b.typeLabel) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'condition') {
            return localeCompare(a.conditionText, b.conditionText) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'rule') {
            return localeCompare(a.ruleDescription, b.ruleDescription) * orderMultiplier;
        }

        return 0;
    };

    const isItemInSearch: IsItemInSearchCallback<TItem> = (item, searchString) => {
        const matchingItems = tokenizedSearch([item], searchString, (i) => i.searchTokens);
        return matchingItems.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<TItem>) => renderRow({item, rowIndex: index, shouldUseNarrowTableLayout});

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
            title={tableTitle}
        >
            <Table.FilterBar label={findRuleLabel} />
            <Table.EmptyState {...emptyState} />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceCategoryRulesTable;
