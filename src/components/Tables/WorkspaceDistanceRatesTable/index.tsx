import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Table from '@components/Table';
import type {ActiveSorting, CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getRateStatus} from '@libs/PolicyDistanceRatesUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import WorkspaceDistanceRatesTableRow from './WorkspaceDistanceRatesTableRow';
import type {DistanceRateTableItemData} from './WorkspaceDistanceRatesTableRow';

type DistanceRatesTableColumnKey = 'status' | 'name' | 'rate' | 'startDate' | 'endDate' | 'enabled' | 'actions';

type WorkspaceDistanceRatesTableProps = {
    ratesData: DistanceRateTableItemData[];
    selectionEnabled: boolean;
    selectedKeys: string[];
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
    EmptyStateComponent?: React.ReactElement;
};

const STATUS_ORDER: Record<string, number> = {
    [CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE]: 0,
    [CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE]: 1,
    [CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED]: 2,
    [CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE]: 3,
};

function WorkspaceDistanceRatesTable({ratesData, selectionEnabled, selectedKeys, onRowSelectionChange, EmptyStateComponent}: WorkspaceDistanceRatesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const tableRef = useRef<TableHandle<DistanceRateTableItemData, DistanceRatesTableColumnKey>>(null);

    const columns: Array<TableColumn<DistanceRatesTableColumnKey>> = [
        {
            key: 'status',
            label: translate('workspace.distanceRates.status'),
            sortable: true,
            width: variables.tableStatusColumnWidth,
            styling: {containerStyles: [styles.justifyContentCenter]},
        },
        {key: 'name', label: translate('common.name'), sortable: true},
        {key: 'rate', label: translate('workspace.distanceRates.rate'), sortable: true},
        {key: 'startDate', label: translate('workspace.distanceRates.startDate'), sortable: true},
        {key: 'endDate', label: translate('workspace.distanceRates.endDate'), sortable: true},
        {key: 'enabled', label: translate('common.enabled'), sortable: true, width: variables.tableSwitchColumnWidth, styling: {containerStyles: [styles.justifyContentEnd]}},
        {key: 'actions', label: '', sortable: false, width: variables.tableCaretColumnWidth},
    ];

    const compareItems: CompareItemsCallback<DistanceRateTableItemData, DistanceRatesTableColumnKey> = (a, b, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'status') {
            const aStatus = getRateStatus(a.rate);
            const bStatus = getRateStatus(b.rate);
            const diff = (STATUS_ORDER[aStatus] ?? 0) - (STATUS_ORDER[bStatus] ?? 0);
            if (diff !== 0) {
                return diff * orderMultiplier;
            }
            return localeCompare(a.rate.name ?? '', b.rate.name ?? '') * orderMultiplier;
        }

        if (activeSorting.columnKey === 'name') {
            return localeCompare(a.rate.name ?? '', b.rate.name ?? '') * orderMultiplier;
        }

        if (activeSorting.columnKey === 'rate') {
            return ((a.rate.rate ?? 0) - (b.rate.rate ?? 0)) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'startDate') {
            return localeCompare(a.rate.startDate ?? '', b.rate.startDate ?? '') * orderMultiplier;
        }

        if (activeSorting.columnKey === 'endDate') {
            return localeCompare(a.rate.endDate ?? '', b.rate.endDate ?? '') * orderMultiplier;
        }

        if (activeSorting.columnKey === 'enabled') {
            return ((a.enabled ? 1 : 0) - (b.enabled ? 1 : 0)) * orderMultiplier;
        }

        return 0;
    };

    const isItemInSearch: IsItemInSearchCallback<DistanceRateTableItemData> = (item, searchString) => {
        const matchingItems = tokenizedSearch([item], searchString, (i) => [i.rate.name ?? '', i.formattedRate]);
        return matchingItems.length > 0;
    };

    const statusLabels = useMemo(
        () => ({
            [CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE]: translate('workspace.distanceRates.statusActive'),
            [CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE]: translate('workspace.distanceRates.statusFuture'),
            [CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED]: translate('workspace.distanceRates.statusExpired'),
            [CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE]: translate('workspace.distanceRates.statusInactive'),
        }),
        [translate],
    );

    const renderItem = ({item, index}: ListRenderItemInfo<DistanceRateTableItemData>) => (
        <WorkspaceDistanceRatesTableRow
            key={item.rateID}
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            statusLabels={statusLabels}
        />
    );

    const isNarrowLayoutRef = useRef(shouldUseNarrowTableLayout);
    const [activeSortingInWideLayout, setActiveSortingInWideLayout] = useState<ActiveSorting<DistanceRatesTableColumnKey> | undefined>(undefined);

    useEffect(() => {
        if (shouldUseNarrowTableLayout) {
            if (isNarrowLayoutRef.current) {
                return;
            }
            isNarrowLayoutRef.current = true;
            const activeSorting = tableRef.current?.getActiveSorting();
            setActiveSortingInWideLayout(activeSorting);
            tableRef.current?.updateSorting({columnKey: 'name', order: 'asc'});
            return;
        }

        if (!isNarrowLayoutRef.current) {
            return;
        }

        isNarrowLayoutRef.current = false;
        if (activeSortingInWideLayout) {
            tableRef.current?.updateSorting(activeSortingInWideLayout);
        }
    }, [activeSortingInWideLayout, shouldUseNarrowTableLayout]);

    const isEmpty = ratesData.length === 0;
    const shouldShowSearchBar = ratesData.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    return (
        <Table
            ref={tableRef}
            data={ratesData}
            columns={columns}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            renderItem={renderItem}
            keyExtractor={(item) => item.keyForList}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="name"
            title={translate('workspace.common.distanceRates')}
        >
            {isEmpty && EmptyStateComponent}
            {!isEmpty && (
                <>
                    {shouldShowSearchBar && <Table.SearchBar label={translate('workspace.distanceRates.findRate')} />}
                    <Table.Header />
                    <Table.Body />
                </>
            )}
        </Table>
    );
}

export default WorkspaceDistanceRatesTable;
