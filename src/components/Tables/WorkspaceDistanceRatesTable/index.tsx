import Table from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getRateStatus} from '@libs/PolicyDistanceRatesUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ListRenderItemInfo} from '@shopify/flash-list';

import React, {useMemo} from 'react';

import type {DistanceRateTableItemData} from './WorkspaceDistanceRatesTableRow';

import WorkspaceDistanceRatesTableRow from './WorkspaceDistanceRatesTableRow';

type DistanceRatesTableColumnKey = 'status' | 'name' | 'rate' | 'startDate' | 'endDate' | 'enabled' | 'actions';

type WorkspaceDistanceRatesTableProps = {
    ratesData: DistanceRateTableItemData[];
    policyID: string;
    selectionEnabled: boolean;
    selectedKeys: string[];
    canWriteDistanceRates: boolean;
    onRowSelectionChange: (selectedRowKeys: string[]) => void;
};

const STATUS_ORDER: Record<string, number> = {
    [CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE]: 0,
    [CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE]: 1,
    [CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED]: 2,
    [CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE]: 3,
};

function WorkspaceDistanceRatesTable({ratesData, policyID, selectionEnabled, selectedKeys, canWriteDistanceRates, onRowSelectionChange}: WorkspaceDistanceRatesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const hasAnyDateBound = ratesData.some((item) => !!item.rate.startDate || !!item.rate.endDate);

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
        ...(hasAnyDateBound
            ? ([
                  {key: 'startDate', label: translate('workspace.distanceRates.startDate'), sortable: true},
                  {key: 'endDate', label: translate('workspace.distanceRates.endDate'), sortable: true},
              ] as const)
            : []),
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

    const emptyStateButtons = canWriteDistanceRates
        ? [
              {
                  icon: icons.Plus,
                  buttonText: translate('workspace.distanceRates.addRate'),

                  success: true,
                  buttonAction: () => {
                      Navigation.navigate(ROUTES.WORKSPACE_CREATE_DISTANCE_RATE.getRoute(policyID));
                  },
              },
          ]
        : undefined;

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
            shouldShowDateColumns={hasAnyDateBound}
            statusLabels={statusLabels}
        />
    );

    return (
        <Table
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
            narrowLayoutSortColumn="name"
            title={translate('workspace.common.distanceRates')}
        >
            <Table.FilterBar label={translate('workspace.distanceRates.findRate')} />
            <Table.EmptyState
                title={translate('workspace.distanceRates.emptyRates.title')}
                subtitle={translate('workspace.distanceRates.emptyRates.subtitle')}
                buttons={emptyStateButtons}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export default WorkspaceDistanceRatesTable;
