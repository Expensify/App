import {getExpenseHeaders} from '@components/Search/SearchTableHeader';
import SortableTableHeader from '@components/Search/SortableTableHeader';
import type {SearchColumnType, SearchSortBy, SortOrder, TableColumnSize} from '@components/Search/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {isSortableColumnName} from '@libs/ReportUtils';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

type SearchTableHeaderProps = {
    sortBy?: SearchSortBy;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchSortBy, order: SortOrder) => void;
    dateColumnSize: TableColumnSize;
    postedColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    shouldShowSorting: boolean;
    columns: SearchColumnType[];
    shouldRemoveTotalColumnFlex?: boolean;

    /** Whether the vendor column is labelled "Supplier", which is what Xero calls vendors */
    shouldUseSupplierLabel?: boolean;
};
function MoneyRequestReportTableHeader({
    sortBy,
    sortOrder,
    onSortPress,
    dateColumnSize,
    postedColumnSize,
    shouldShowSorting,
    columns,
    amountColumnSize,
    taxAmountColumnSize,
    shouldRemoveTotalColumnFlex,
    shouldUseSupplierLabel = false,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    const columnConfig = useMemo(
        () => [
            ...getExpenseHeaders().map((header) => ({
                ...header,
                translationKey: header.columnName === CONST.SEARCH.TABLE_COLUMNS.VENDOR ? getSearchColumnTranslationKey(header.columnName, shouldUseSupplierLabel) : header.translationKey,
                isColumnSortable: isSortableColumnName(header.columnName),
            })),
            {
                columnName: CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
                translationKey: undefined,
                isColumnSortable: false,
            },
        ],
        [shouldUseSupplierLabel],
    );

    const orderedColumnConfig = useMemo(() => {
        if (columns.length === 0) {
            return columnConfig;
        }

        const configMap = new Map(columnConfig.map((config) => [config.columnName, config]));
        const ordered: typeof columnConfig = [];

        for (const columnName of columns) {
            const config = configMap.get(columnName);
            if (config) {
                ordered.push(config);
                configMap.delete(columnName);
            }
        }

        for (const config of configMap.values()) {
            ordered.push(config);
        }

        return ordered;
    }, [columns, columnConfig]);

    const shouldShowColumn = useCallback(
        (columnName: SearchColumnType) => {
            return columns.includes(columnName);
        },
        [columns],
    );

    return (
        <View style={[styles.dFlex, styles.flex5]}>
            <SortableTableHeader
                columns={orderedColumnConfig}
                shouldShowColumn={shouldShowColumn}
                dateColumnSize={dateColumnSize}
                postedColumnSize={postedColumnSize}
                amountColumnSize={amountColumnSize}
                taxAmountColumnSize={taxAmountColumnSize}
                shouldShowSorting={shouldShowSorting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortPress={onSortPress}
                shouldRemoveTotalColumnFlex={shouldRemoveTotalColumnFlex}
            />
        </View>
    );
}

export default MoneyRequestReportTableHeader;
