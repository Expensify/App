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
};

const shouldShowColumnConfig: Record<SortableColumnName, (isIOUReport: boolean) => boolean> = {
    [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: (isIOUReport) => !isIOUReport,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: (isIOUReport) => !isIOUReport,
    [CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.IN]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.TO]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.TITLE]: () => false,
    [CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE]: () => false,
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
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
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
    isIOUReport: boolean;
};

function MoneyRequestReportTableHeader({sortBy, sortOrder, onSortPress, dateColumnSize, shouldShowSorting, isIOUReport, amountColumnSize, taxAmountColumnSize}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    const shouldShowColumn = useCallback(
        (columnName: SortableColumnName) => {
            const shouldShowFun = shouldShowColumnConfig[columnName];
            if (!shouldShowFun) {
                return false;
            }
            return shouldShowFun(isIOUReport);
        },
        [isIOUReport],
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
