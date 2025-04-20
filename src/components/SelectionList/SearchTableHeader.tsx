import React, {useCallback} from 'react';
import type {SearchColumnType, SortOrder} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getShouldShowMerchant} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import SortableTableHeader from './SortableTableHeader';
import type {SortableColumnName} from './types';

type ShouldShowSearchColumnFn = (data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']) => boolean;

type SearchColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths;
    isColumnSortable?: boolean;
};

const shouldShowColumnConfig: Record<SortableColumnName, ShouldShowSearchColumnFn> = {
    [CONST.SEARCH.TABLE_COLUMNS.RECEIPT]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.TYPE]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.DATE]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.MERCHANT]: (data: OnyxTypes.SearchResults['data']) => getShouldShowMerchant(data),
    [CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION]: (data: OnyxTypes.SearchResults['data']) => !getShouldShowMerchant(data),
    [CONST.SEARCH.TABLE_COLUMNS.FROM]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.TO]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.CATEGORY]: (data, metadata) => metadata?.columnsToShow?.shouldShowCategoryColumn ?? false,
    [CONST.SEARCH.TABLE_COLUMNS.TAG]: (data, metadata) => metadata?.columnsToShow?.shouldShowTagColumn ?? false,
    [CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT]: (data, metadata) => metadata?.columnsToShow?.shouldShowTaxColumn ?? false,
    [CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT]: () => true,
    [CONST.SEARCH.TABLE_COLUMNS.ACTION]: () => true,
    // This column is never displayed on Search
    [CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS]: () => false,
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
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
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
        columnName: CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
        translationKey: 'common.tax',
        isColumnSortable: false,
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

const SearchColumns = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: expenseHeaders,
    [CONST.SEARCH.DATA_TYPES.INVOICE]: expenseHeaders,
    [CONST.SEARCH.DATA_TYPES.TRIP]: expenseHeaders,
    [CONST.SEARCH.DATA_TYPES.CHAT]: null,
};

type SearchTableHeaderProps = {
    data: OnyxTypes.SearchResults['data'];
    metadata: OnyxTypes.SearchResults['search'];
    sortBy?: SearchColumnType;
    sortOrder?: SortOrder;
    onSortPress: (column: SearchColumnType, order: SortOrder) => void;
    shouldShowYear: boolean;
    shouldShowSorting: boolean;
};

function SearchTableHeader({data, metadata, sortBy, sortOrder, onSortPress, shouldShowYear, shouldShowSorting}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    const shouldShowColumn = useCallback(
        (columnName: SortableColumnName) => {
            const shouldShowFun = shouldShowColumnConfig[columnName];
            return shouldShowFun(data, metadata);
        },
        [data, metadata],
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
            shouldShowColumn={shouldShowColumn}
            dateColumnSize={shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
            shouldShowSorting={shouldShowSorting}
            sortBy={sortBy}
            sortOrder={sortOrder}
            containerStyles={styles.pl4}
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

export default SearchTableHeader;
