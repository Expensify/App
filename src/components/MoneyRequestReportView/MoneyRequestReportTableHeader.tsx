import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {SortOrder, TableColumnSize} from '@components/Search/types';
import SortableTableHeader from '@components/SelectionList/SortableTableHeader';
import type {SortableColumnName} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type ColumnConfig = {
    columnName: SortableColumnName;
    translationKey: TranslationPaths | undefined;
    isColumnSortable?: boolean;
    canBeMissing?: boolean;
};

const columnConfig: ColumnConfig[] = [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
        translationKey: 'common.receipt',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TYPE,
        translationKey: 'common.type',
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
        translationKey: 'common.merchant',
        canBeMissing: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
        canBeMissing: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
        canBeMissing: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
        canBeMissing: true,
    },
    {
        columnName: CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS,
        translationKey: undefined, // comments have no title displayed
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: 'common.total',
    },
];

type SearchTableHeaderProps = {
    sortBy?: SortableColumnName;
    sortOrder?: SortOrder;
    onSortPress: (column: SortableColumnName, order: SortOrder) => void;
    dateColumnSize: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    shouldShowSorting: boolean;
    columns: SortableColumnName[];
};

function MoneyRequestReportTableHeader({sortBy, sortOrder, onSortPress, dateColumnSize, shouldShowSorting, amountColumnSize, taxAmountColumnSize, columns}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    const shouldShowColumn = useCallback(
        (columnName: SortableColumnName) => {
            return columns.includes(columnName);
        },
        [columns],
    );

    return (
        <View style={[styles.dFlex, styles.flex5]}>
            <SortableTableHeader
                columns={columnConfig}
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

MoneyRequestReportTableHeader.displayName = 'MoneyRequestReportTableHeader';

export default MoneyRequestReportTableHeader;
