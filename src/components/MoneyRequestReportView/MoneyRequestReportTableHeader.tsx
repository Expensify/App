import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {getExpenseHeaders} from '@components/Search/SearchTableHeader';
import SortableTableHeader from '@components/Search/SortableTableHeader';
import type {SearchColumnType, SortOrder, TableColumnSize} from '@components/Search/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSortableColumnName} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type SearchTableHeaderProps = {
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchColumnType, order: SortOrder) => void;
    dateColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    shouldShowSorting: boolean;
    columns: SearchColumnType[];
    shouldRemoveTotalColumnFlex?: boolean;
};
function MoneyRequestReportTableHeader({
    sortBy,
    sortOrder,
    onSortPress,
    dateColumnSize,
    shouldShowSorting,
    columns,
    amountColumnSize,
    taxAmountColumnSize,
    shouldRemoveTotalColumnFlex,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    const columnConfig = useMemo(
        () => [
            ...getExpenseHeaders().map((header) => ({
                ...header,
                isColumnSortable: isSortableColumnName(header.columnName),
            })),
            {
                columnName: CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
                translationKey: undefined,
                isColumnSortable: false,
            },
        ],
        [],
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
