import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';
import Table from '@components/Table';
import type {TableEmptyStateProps} from '@components/Table/TableEmptyStates/TableEmptyState';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React from 'react';

import WorkspacePerDiemTableRow from './WorkspacePerDiemTableRow';

type PerDiemTableColumnKey = 'destination' | 'subrate' | 'amount' | 'actions';

type PerDiemTableRowData = TableData & {
    subRateID: string;
    rateID: string;
    destination: string;
    subRateName: string;
    rate: number;
    formattedAmount: string;
    disabled?: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
};

type WorkspacePerDiemTableProps = {
    perDiemData: PerDiemTableRowData[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    emptyState: TableEmptyStateProps;
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

export default function WorkspacePerDiemTable({perDiemData, selectionEnabled, selectedKeys, emptyState, onRowSelectionChange}: WorkspacePerDiemTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const columns: Array<TableColumn<PerDiemTableColumnKey>> = [
        {key: 'destination', label: translate('common.destination'), sortable: true},
        {key: 'subrate', label: translate('common.subrate'), sortable: true},
        {
            key: 'amount',
            label: translate('workspace.perDiem.amount'),
            sortable: true,
            styling: {
                containerStyles: [styles.justifyContentEnd],
            },
        },
        {key: 'actions', label: '', sortable: false, width: variables.tableCaretColumnWidth},
    ];

    const compareItems: CompareItemsCallback<PerDiemTableRowData, PerDiemTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        const destinationComparison = localeCompare(item1.destination, item2.destination) * orderMultiplier;
        const subRateNameComparison = localeCompare(item1.subRateName, item2.subRateName) * orderMultiplier;
        const amountComparison = (item1.rate - item2.rate) * orderMultiplier;

        if (activeSorting.columnKey === 'destination') {
            if (destinationComparison !== 0) {
                return destinationComparison;
            }
            if (subRateNameComparison !== 0) {
                return subRateNameComparison;
            }
            return amountComparison;
        }

        if (activeSorting.columnKey === 'subrate') {
            if (subRateNameComparison !== 0) {
                return subRateNameComparison;
            }
            if (destinationComparison !== 0) {
                return destinationComparison;
            }
            return amountComparison;
        }

        if (activeSorting.columnKey === 'amount') {
            if (amountComparison !== 0) {
                return amountComparison;
            }
            if (destinationComparison !== 0) {
                return destinationComparison;
            }
            return subRateNameComparison;
        }

        return 0;
    };

    const isItemInSearch: IsItemInSearchCallback<PerDiemTableRowData> = (item, searchString) => {
        const matchingItems = tokenizedSearch([item], searchString, (option) => [option.destination, option.subRateName]);
        return matchingItems.length > 0;
    };

    const renderItem = ({item, index}: ListRenderItemInfo<PerDiemTableRowData>) => (
        <WorkspacePerDiemTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
        />
    );

    return (
        <Table
            data={perDiemData}
            columns={columns}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            renderItem={renderItem}
            keyExtractor={(item) => item.keyForList}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="destination"
            narrowLayoutSortColumn="destination"
            title={translate('common.perDiem')}
        >
            <Table.FilterBar label={translate('workspace.perDiem.findPerDiemRate')} />
            <Table.EmptyState {...emptyState} />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {PerDiemTableRowData, PerDiemTableColumnKey};
