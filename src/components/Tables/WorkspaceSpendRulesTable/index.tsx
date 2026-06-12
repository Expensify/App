import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import Table from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import WorkspaceSpendRulesTableRow from './WorkspaceSpendRulesTableRow';
import type {SpendRuleTableItem} from './WorkspaceSpendRulesTableRow';

type SpendRulesTableColumnKey = 'type' | 'card' | 'rule' | 'actions';

type WorkspaceSpendRulesTableProps = {
    rulesData: SpendRuleTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    emptyStateContent?: React.ReactElement;
};

function WorkspaceSpendRulesTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange, emptyStateContent}: WorkspaceSpendRulesTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<SpendRulesTableColumnKey>> = [
        {
            key: 'type',
            label: translate('workspace.rules.spendRules.tableColumnType'),
            sortable: true,
            width: variables.tableTypeColumnWidth,
            styling: {containerStyles: [{justifyContent: 'center'}]},
        },
        {key: 'card', label: translate('workspace.rules.spendRules.tableColumnCard'), sortable: true},
        {key: 'rule', label: translate('workspace.rules.spendRules.tableColumnRule'), sortable: false},
        {key: 'actions', label: '', sortable: false, width: variables.tableCaretColumnWidth},
    ];

    const compareItems: CompareItemsCallback<SpendRuleTableItem, SpendRulesTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'type') {
            const aVal = a.isBlock ? 0 : 1;
            const bVal = b.isBlock ? 0 : 1;
            const diff = aVal - bVal;
            if (diff !== 0) {
                return diff * orderMultiplier;
            }
            return localeCompare(a.cardSummary, b.cardSummary) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'card') {
            return localeCompare(a.cardSummary, b.cardSummary) * orderMultiplier;
        }

        return 0;
    };

    const isItemInSearch: IsItemInSearchCallback<SpendRuleTableItem> = (item, searchString) => {
        const matchingItems = tokenizedSearch([item], searchString, (i) => i.searchTokens);
        return matchingItems.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<SpendRuleTableItem>) => (
        <WorkspaceSpendRulesTableRow
            key={item.ruleID}
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    const shouldShowSearchBar = rulesData.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const isEmpty = rulesData.length === 0;

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
            initialSortColumn="card"
            narrowLayoutSortColumn="card"
            title={translate('workspace.rules.tabs.cardRestrictions')}
        >
            {shouldShowSearchBar && <Table.SearchBar label={translate('workspace.rules.spendRules.findRule')} />}
            <Table.Header showOnEmpty={!!emptyStateContent} />
            {isEmpty ? emptyStateContent : <Table.Body />}
        </Table>
    );
}

export default WorkspaceSpendRulesTable;
export type {SpendRuleTableItem};
