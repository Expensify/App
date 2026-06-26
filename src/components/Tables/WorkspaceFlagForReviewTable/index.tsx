import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import Table from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FlagForReviewTableItem} from '@libs/FlagForReviewRulesUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import WorkspaceFlagForReviewTableRow from './WorkspaceFlagForReviewTableRow';

type FlagForReviewTableColumnKey = 'type' | 'condition' | 'rule' | 'actions';

type WorkspaceFlagForReviewTableProps = {
    rulesData: FlagForReviewTableItem[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    emptyStateContent?: React.ReactElement;
};

function WorkspaceFlagForReviewTable({rulesData, selectionEnabled, selectedKeys, onRowSelectionChange, emptyStateContent}: WorkspaceFlagForReviewTableProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<FlagForReviewTableColumnKey>> = [
        {
            key: 'type',
            label: translate('workspace.rules.flagForReviewTable.tableColumnType'),
            sortable: true,
            width: variables.tableTypeColumnWidth,
            styling: {containerStyles: [styles.justifyContentCenter]},
        },
        {key: 'condition', label: translate('workspace.rules.flagForReviewTable.tableColumnCondition'), sortable: true},
        {key: 'rule', label: translate('workspace.rules.flagForReviewTable.tableColumnRule'), sortable: true},
        {key: 'actions', label: '', sortable: false, width: variables.tableCaretColumnWidth},
    ];

    const compareItems: CompareItemsCallback<FlagForReviewTableItem, FlagForReviewTableColumnKey> = (a, b, activeSorting) => {
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

    const isItemInSearch: IsItemInSearchCallback<FlagForReviewTableItem> = (item, searchString) => {
        const matchingItems = tokenizedSearch([item], searchString, (i) => i.searchTokens);
        return matchingItems.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<FlagForReviewTableItem>) => (
        <WorkspaceFlagForReviewTableRow
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
            initialSortColumn="condition"
            narrowLayoutSortColumn="condition"
            title={translate('workspace.rules.tabs.flagForReview')}
        >
            {isEmpty && emptyStateContent}
            {(!isEmpty || !emptyStateContent) && (
                <>
                    {shouldShowSearchBar && !isEmpty && <Table.SearchBar label={translate('workspace.rules.flagForReviewTable.findRule')} />}
                    <Table.Header />
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export default WorkspaceFlagForReviewTable;
