import Table, {composeTableHeaderComponent} from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData, TableRenderRowProps} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';
import {View} from 'react-native';

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
    headerComponent?: React.ReactElement;
    emptyStateContent?: React.ReactElement;
    tableTitle: string;
    findRuleLabel: string;
    typeColumnLabel: string;
    conditionColumnLabel: string;
    ruleColumnLabel: string;
    renderRow: (props: TableRenderRowProps<TItem>) => React.ReactElement;
};

function WorkspaceCategoryRulesTable<TItem extends CategoryRulesTableItem>({
    rulesData,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    headerComponent,
    emptyStateContent,
    tableTitle,
    findRuleLabel,
    typeColumnLabel,
    conditionColumnLabel,
    ruleColumnLabel,
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

    const shouldShowSearchBar = rulesData.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const isEmpty = rulesData.length === 0;
    const searchBarComponent = shouldShowSearchBar && !isEmpty ? <Table.SearchBar label={findRuleLabel} /> : undefined;
    const tableHeaderComponent = composeTableHeaderComponent(headerComponent, searchBarComponent);

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
            headerComponent={tableHeaderComponent}
            shouldUseStickyColumnHeader
            ListEmptyComponent={emptyStateContent ? <View style={[styles.flex1, styles.mnh0, styles.w100]}>{emptyStateContent}</View> : undefined}
        >
            {(!isEmpty || !!emptyStateContent || !!headerComponent) && <Table.Body />}
        </Table>
    );
}

export default WorkspaceCategoryRulesTable;
