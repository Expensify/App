import React from 'react';
import {View} from 'react-native';
import type {SearchColumnType, SortOrder} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUIUtils from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import SortableHeaderText from './SortableHeaderText';

type SearchColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths;
    isColumnSortable?: boolean;
    shouldShow: (data: OnyxTypes.SearchResults['data'], metadata: OnyxTypes.SearchResults['search']) => boolean;
};

const expenseHeaders: SearchColumnConfig[] = [
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.RECEIPT,
        translationKey: 'common.receipt',
        shouldShow: () => true,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TYPE,
        translationKey: 'common.type',
        shouldShow: () => true,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
        shouldShow: () => true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
        translationKey: 'common.merchant',
        shouldShow: (data: OnyxTypes.SearchResults['data']) => SearchUIUtils.getShouldShowMerchant(data),
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
        shouldShow: (data: OnyxTypes.SearchResults['data']) => !SearchUIUtils.getShouldShowMerchant(data),
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
        shouldShow: () => true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TO,
        translationKey: 'common.to',
        shouldShow: () => true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
        shouldShow: (data, metadata) => metadata?.columnsToShow?.shouldShowCategoryColumn ?? false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
        shouldShow: (data, metadata) => metadata?.columnsToShow?.shouldShowTagColumn ?? false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT,
        translationKey: 'common.tax',
        shouldShow: (data, metadata) => metadata?.columnsToShow?.shouldShowTaxColumn ?? false,
        isColumnSortable: false,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        translationKey: 'common.total',
        shouldShow: () => true,
    },
    {
        columnName: CONST.SEARCH.TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        shouldShow: () => true,
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
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {translate} = useLocalize();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    if (SearchColumns[metadata.type] === null) {
        return;
    }

    if (displayNarrowVersion) {
        return;
    }

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.pl4]}>
                {SearchColumns[metadata.type]?.map(({columnName, translationKey, shouldShow, isColumnSortable}) => {
                    if (!shouldShow(data, metadata)) {
                        return null;
                    }

                    const isSortable = shouldShowSorting && isColumnSortable;
                    const isActive = sortBy === columnName;
                    const textStyle = columnName === CONST.SEARCH.TABLE_COLUMNS.RECEIPT ? StyleUtils.getTextOverflowStyle('clip') : null;

                    return (
                        <SortableHeaderText
                            key={translationKey}
                            text={translate(translationKey)}
                            textStyle={textStyle}
                            sortOrder={sortOrder ?? CONST.SEARCH.SORT_ORDER.ASC}
                            isActive={isActive}
                            containerStyle={[StyleUtils.getSearchTableColumnStyles(columnName, shouldShowYear)]}
                            isSortable={isSortable}
                            onPress={(order: SortOrder) => onSortPress(columnName, order)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
