import React from 'react';
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
    shouldShowSorting: boolean;
};

// At this moment with new Report View we have no extra logic for displaying columns
const shouldShowColumn = () => true;

function MoneyRequestReportTableHeader({sortBy, sortOrder, onSortPress, dateColumnSize, shouldShowSorting}: SearchTableHeaderProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.dFlex, styles.flex5]}>
            <SortableTableHeader
                columns={columnConfig}
                shouldShowColumn={shouldShowColumn}
                dateColumnSize={dateColumnSize}
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
