import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import AgentsTableRow from './AgentsTableRow';

type AgentsTableColumnKey = 'agent' | 'actions';

type AgentRowData = TableData & {
    accountID: number;
    displayName: string;
    login: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    onChatPress: () => void;
    onCopilotPress: () => void;
    dismissError: () => void;
};

type AgentsTableProps = {
    agents: AgentRowData[];
};

export default function AgentsTable({agents}: AgentsTableProps) {
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const agentsTableColumns: Array<TableColumn<AgentsTableColumnKey>> = [
        {
            key: 'agent',
            label: translate('agentsPage.title'),
            sortable: true,
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: shouldUseNarrowTableLayout ? variables.tableCaretColumnWidth : variables.agentsTableActionColumnWidth,
        },
    ];

    const compareTableItems: CompareItemsCallback<AgentRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return localeCompare(item1.displayName, item2.displayName) * orderMultiplier;
    };

    const isTableItemInSearch: IsItemInSearchCallback<AgentRowData> = (item, searchValue) => {
        const results = tokenizedSearch([item], searchValue, (option) => [option.displayName, option.login]);
        return results.length > 0;
    };

    const renderTableItem = ({item, index}: ListRenderItemInfo<AgentRowData>) => (
        <AgentsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={agents}
            columns={agentsTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="agent"
            title={translate('agentsPage.title')}
            keyExtractor={(item) => item.keyForList}
        >
            <Table.FilterBar label={translate('agentsPage.findAgent')} />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {AgentRowData, AgentsTableColumnKey};
