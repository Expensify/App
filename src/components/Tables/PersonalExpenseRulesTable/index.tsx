import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {clearDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import ROUTES from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

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
    personalExpenseRules: PersonalExpenseRuleRowData[];
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function PersonalExpenseRulesTable({personalExpenseRules, selectedKeys, onRowSelectionChange}: PersonalExpenseRulesTableProps) {
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
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

    const navigateToNewRulePage = () => {
        clearDraftRule();
        Navigation.navigate(ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

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
        >
            <Table.FilterBar label={translate('expenseRulesPage.findRule')} />
            <Table.EmptyState
                title={translate('expenseRulesPage.emptyRules.title')}
                subtitle={translate('expenseRulesPage.emptyRules.subtitle')}
                buttons={[
                    {
                        success: true,
                        buttonAction: navigateToNewRulePage,
                        icon: icons.Plus,
                        buttonText: translate('expenseRulesPage.newRule'),
                    },
                ]}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {PersonalExpenseRuleRowData, PersonalExpenseRulesTableColumnKey};
