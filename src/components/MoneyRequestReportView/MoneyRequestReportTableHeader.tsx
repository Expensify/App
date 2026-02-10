import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {SearchColumnType, SortOrder, TableColumnSize} from '@components/Search/types';
import SortableTableHeader from '@components/SelectionListWithSections/SortableTableHeader';
import type {SortableColumnName} from '@components/SelectionListWithSections/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type ColumnConfig = {
    columnName: SearchColumnType;
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
        isColumnSortable: true,
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE,
        translationKey: 'common.reimbursable',
        canBeMissing: true,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.BILLABLE,
        translationKey: 'common.billable',
        canBeMissing: true,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.COMMENTS,
        translationKey: undefined, // comments have no title displayed
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: 'iou.amount',
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
    columns: SearchColumnType[];
};
function MoneyRequestReportTableHeader({sortBy, sortOrder, onSortPress, dateColumnSize, shouldShowSorting, columns, amountColumnSize, taxAmountColumnSize}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    const shouldShowColumn = useCallback(
        (columnName: SearchColumnType) => {
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

export default MoneyRequestReportTableHeader;
