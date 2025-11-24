import React, {useCallback, useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import type {SearchColumnType, SearchGroupBy, SortOrder} from '@components/Search/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SortableTableHeader from './SortableTableHeader';
import type {SortableColumnName} from './types';

type SearchColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
    canBeMissing?: boolean;
};

const getExpenseHeaders = (groupBy?: SearchGroupBy): SearchColumnConfig[] => [
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
        translationKey: groupBy ? 'common.total' : 'iou.amount',
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

const getExpenseReportHeaders = (profileIcon?: IconAsset): SearchColumnConfig[] => [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.AVATAR,
        translationKey: undefined,
        icon: profileIcon,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.STATUS,
        translationKey: 'common.status',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TITLE,
        translationKey: 'common.reportName',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TO,
        translationKey: 'common.to',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        translationKey: 'common.total',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isColumnSortable: false,
    },
];

function getSearchColumns(type: ValueOf<typeof CONST.SEARCH.DATA_TYPES>, groupBy?: SearchGroupBy, profileIcon?: IconAsset) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
            return getExpenseHeaders(groupBy);
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return getExpenseHeaders(groupBy);
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return getExpenseHeaders(groupBy);
        case CONST.SEARCH.DATA_TYPES.TASK:
            return taskHeaders;
        case CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT:
            return getExpenseReportHeaders(profileIcon);
        case CONST.SEARCH.DATA_TYPES.CHAT:
        default:
            return null;
    }
}

type SearchTableHeaderProps = {
    columns: SortableColumnName[];
    type: SearchDataTypes;
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchColumnType, order: SortOrder) => void;
    shouldShowYear: boolean;
    isAmountColumnWide: boolean;
    isTaxAmountColumnWide: boolean;
    shouldShowSorting: boolean;
    canSelectMultiple: boolean;
    areAllOptionalColumnsHidden: boolean;
    groupBy: SearchGroupBy | undefined;
};

function SearchTableHeader({
    columns,
    type,
    sortBy,
    sortOrder,
    onSortPress,
    shouldShowYear,
    shouldShowSorting,
    canSelectMultiple,
    isAmountColumnWide,
    isTaxAmountColumnWide,
    areAllOptionalColumnsHidden,
    groupBy,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    // Only load Profile icon when it's needed for EXPENSE_REPORT type
    const icons = useMemoizedLazyExpensifyIcons(type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT ? (['Profile'] as const) : ([] as const));

    const shouldShowColumn = useCallback(
        (columnName: SortableColumnName) => {
            return columns.includes(columnName);
        },
        [columns],
    );

    const columnConfig = useMemo(() => getSearchColumns(type, groupBy, icons.Profile), [type, groupBy, icons.Profile]);

    if (displayNarrowVersion) {
        return;
    }

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
export {getExpenseHeaders};
export default SearchTableHeader;
