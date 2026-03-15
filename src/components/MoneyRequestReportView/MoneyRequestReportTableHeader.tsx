import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {SearchColumnType, SortOrder, TableColumnSize} from '@components/Search/types';
import {getExpenseHeaders} from '@components/SelectionListWithSections/SearchTableHeader';
import SortableTableHeader from '@components/SelectionListWithSections/SortableTableHeader';
import type {SortableColumnName} from '@components/SelectionListWithSections/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchTableHeaderProps = {
    sortBy?: SortableColumnName;
    sortOrder?: SortOrder;
    onSortPress: (column: SortableColumnName, order: SortOrder) => void;
    dateColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    shouldShowSorting: boolean;
    columns: SearchColumnType[];
    sortableColumns?: readonly SearchColumnType[];
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
    sortableColumns,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    const columnConfig = useMemo(
        () => [
            ...getExpenseHeaders().map((header) => ({
                ...header,
                isColumnSortable: sortableColumns ? sortableColumns.includes(header.columnName) : header.isColumnSortable,
            })),
            {
                columnName: CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
                translationKey: undefined,
                isColumnSortable: false,
            },
        ],
        [sortableColumns],
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
            />
        </View>
    );
}

export default MoneyRequestReportTableHeader;
