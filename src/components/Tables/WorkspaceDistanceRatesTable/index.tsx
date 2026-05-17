import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Table from '@components/Table';
import type {ActiveSorting, CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableHandle} from '@components/Table';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {getRateStatus} from '@libs/PolicyDistanceRatesUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {Rate} from '@src/types/onyx/Policy';
import WorkspaceDistanceRatesTableRow from './WorkspaceDistanceRatesTableRow';
import type {DistanceRateTableItemData} from './WorkspaceDistanceRatesTableRow';

type DistanceRatesTableColumnKey = 'status' | 'name' | 'rate' | 'startDate' | 'endDate';

type WorkspaceDistanceRatesTableProps = {
    customUnitRates: Record<string, Rate>;
    unitTranslation: string;
    selectedDistanceRates: string[];
    canSelectMultiple: boolean;
    onToggleRate: (rateID: string) => void;
    onToggleAllRates: () => void;
    onPressRate: (rateID: string) => void;
    onDismissError: (rateID: string) => void;
    pendingAction?: OnyxCommon.PendingAction;
    pendingFields?: OnyxCommon.PendingFields<string>;
};

const STATUS_ORDER: Record<string, number> = {
    [CONST.CUSTOM_UNITS.RATE_STATUS.ACTIVE]: 0,
    [CONST.CUSTOM_UNITS.RATE_STATUS.FUTURE]: 1,
    [CONST.CUSTOM_UNITS.RATE_STATUS.EXPIRED]: 2,
    [CONST.CUSTOM_UNITS.RATE_STATUS.INACTIVE]: 3,
};

function WorkspaceDistanceRatesTable({
    customUnitRates,
    unitTranslation,
    selectedDistanceRates,
    canSelectMultiple,
    onToggleRate,
    onToggleAllRates,
    onPressRate,
    onDismissError,
    pendingAction,
    pendingFields,
}: WorkspaceDistanceRatesTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const tableRef = useRef<TableHandle<DistanceRateTableItemData, DistanceRatesTableColumnKey>>(null);

    const columns: Array<TableColumn<DistanceRatesTableColumnKey>> = [
        {key: 'status', label: translate('workspace.distanceRates.status')},
        {key: 'name', label: translate('common.name')},
        {key: 'rate', label: translate('workspace.distanceRates.rate')},
        {key: 'startDate', label: translate('workspace.distanceRates.startDate')},
        {key: 'endDate', label: translate('workspace.distanceRates.endDate')},
    ];

    const ratesData: DistanceRateTableItemData[] = Object.values(customUnitRates).map((rate) => {
        const resolvedPendingAction =
            rate.pendingAction ??
            rate.pendingFields?.rate ??
            rate.pendingFields?.enabled ??
            rate.pendingFields?.currency ??
            rate.pendingFields?.name ??
            pendingFields?.attributes ??
            (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ? pendingAction : undefined);

        return {
            rateID: rate.customUnitRateID,
            rate,
            formattedRate: `${convertAmountToDisplayString(rate.rate, rate.currency ?? CONST.CURRENCY.USD)} / ${unitTranslation}`,
            pendingAction: resolvedPendingAction ?? undefined,
            errors: rate.errors ?? undefined,
            onDismissError: () => onDismissError(rate.customUnitRateID),
        };
    });

    const keyExtractor = (item: DistanceRateTableItemData) => item.rateID;

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: styles.pb4,
    });

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
            isSelected={selectedDistanceRates.includes(item.rateID)}
            canSelectMultiple={canSelectMultiple}
            onToggle={() => onToggleRate(item.rateID)}
            onPress={() => onPressRate(item.rateID)}
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

        if (!activeSortingInWideLayout || !isNarrowLayoutRef.current) {
            return;
        }

        isNarrowLayoutRef.current = false;
        tableRef.current?.updateSorting(activeSortingInWideLayout);
    }, [activeSortingInWideLayout, shouldUseNarrowTableLayout]);

    const allSelected = ratesData.length > 0 && ratesData.every((item) => selectedDistanceRates.includes(item.rateID));
    const someSelected = selectedDistanceRates.length > 0 && !allSelected;

    const SelectAllHeader = canSelectMultiple ? (
        <View style={[styles.mr3, styles.alignSelfCenter]}>
            <Checkbox
                isChecked={allSelected}
                isIndeterminate={someSelected}
                onPress={onToggleAllRates}
                accessibilityLabel={translate('accessibilityHints.selectAllDistanceRates')}
            />
        </View>
    ) : null;

    const ListHeader = !shouldUseNarrowTableLayout ? <Table.Header /> : null;

    return (
        <Table
            ref={tableRef}
            data={ratesData}
            columns={columns}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="name"
            title={translate('workspace.common.distanceRates')}
            ListHeaderComponent={shouldUseNarrowTableLayout ? ListHeader : undefined}
        >
            {!shouldUseNarrowTableLayout && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mh5]}>
                    {SelectAllHeader}
                    <View style={[styles.flex1]}>
                        <Table.Header />
                    </View>
                </View>
            )}

            <Table.Body contentContainerStyle={tableBodyContentContainerStyle} />
        </Table>
    );
}

export default WorkspaceDistanceRatesTable;
export type {DistanceRateTableItemData, DistanceRatesTableColumnKey};
