import React, {useCallback} from 'react';
import type {SearchColumnType, SearchGroupBy, SortOrder} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import SortableTableHeader from './SortableTableHeader';
import type {SortableColumnName} from './types';

type SearchColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths;
    isColumnSortable?: boolean;
    canBeMissing?: boolean;
};

const expenseHeaders: SearchColumnConfig[] = [
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
        canBeMissing: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TO,
        translationKey: 'common.to',
        canBeMissing: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CARD,
        translationKey: 'common.card',
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID,
        translationKey: 'common.withdrawalID',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
        translationKey: 'common.tax',
        isColumnSortable: false,
        canBeMissing: true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: 'common.total',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];

const taskHeaders: SearchColumnConfig[] = [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
        canBeMissing: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TITLE,
        translationKey: 'common.title',
        canBeMissing: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
        canBeMissing: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
        canBeMissing: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.IN,
        translationKey: 'common.sharedIn',
        isColumnSortable: false,
        canBeMissing: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ASSIGNEE,
        translationKey: 'common.assignee',
        canBeMissing: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
        canBeMissing: false,
    },
];

const SearchColumns = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: expenseHeaders,
    [CONST.SEARCH.DATA_TYPES.INVOICE]: expenseHeaders,
    [CONST.SEARCH.DATA_TYPES.TRIP]: expenseHeaders,
    [CONST.SEARCH.DATA_TYPES.TASK]: taskHeaders,
    [CONST.SEARCH.DATA_TYPES.CHAT]: null,
};

type SearchTableHeaderProps = {
    columns: SortableColumnName[];
    metadata: OnyxTypes.SearchResults['search'];
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchColumnType, order: SortOrder) => void;
    shouldShowYear: boolean;
    isAmountColumnWide: boolean;
    isTaxAmountColumnWide: boolean;
    shouldShowSorting: boolean;
    canSelectMultiple: boolean;
    groupBy: SearchGroupBy | undefined;
    areAllOptionalColumnsHidden: boolean;
};

function SearchTableHeader({
    columns,
    metadata,
    sortBy,
    sortOrder,
    onSortPress,
    shouldShowYear,
    shouldShowSorting,
    canSelectMultiple,
    isAmountColumnWide,
    isTaxAmountColumnWide,
    groupBy,
    areAllOptionalColumnsHidden,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    const shouldShowColumn = useCallback(
        (columnName: SortableColumnName) => {
            if (groupBy === CONST.SEARCH.GROUP_BY.FROM) {
                return columnName === CONST.SEARCH.TABLE_COLUMNS.FROM || columnName === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT || columnName === CONST.SEARCH.TABLE_COLUMNS.ACTION;
            }
            if (groupBy === CONST.SEARCH.GROUP_BY.CARD) {
                return columnName === CONST.SEARCH.TABLE_COLUMNS.CARD || columnName === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT || columnName === CONST.SEARCH.TABLE_COLUMNS.ACTION;
            }
            if (groupBy === CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID) {
                return columnName === CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID || columnName === CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT || columnName === CONST.SEARCH.TABLE_COLUMNS.ACTION;
            }

            return columns.includes(columnName);
        },
        [columns, groupBy],
    );

    if (displayNarrowVersion) {
        return;
    }

    const columnConfig = SearchColumns[metadata.type];

    if (!columnConfig) {
        return;
    }

    return (
        <SortableTableHeader
            columns={columnConfig}
            areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
            shouldShowColumn={shouldShowColumn}
            dateColumnSize={shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            amountColumnSize={isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            taxAmountColumnSize={isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            shouldShowSorting={shouldShowSorting}
            sortBy={sortBy}
            sortOrder={sortOrder}
            // Don't butt up against the 'select all' checkbox if present
            containerStyles={canSelectMultiple && [styles.pl4]}
            onSortPress={(columnName, order) => {
                if (columnName === CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS) {
                    return;
                }
                onSortPress(columnName, order);
            }}
        />
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';
export {expenseHeaders};
export default SearchTableHeader;
