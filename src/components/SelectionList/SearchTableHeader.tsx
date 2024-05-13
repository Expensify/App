import React, {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import SortableHeaderText from './SortableHeaderText';

type SearchColumnConfig = {
    columnName: (typeof CONST.SEARCH_TABLE_COLUMNS)[keyof typeof CONST.SEARCH_TABLE_COLUMNS];
    translationKey: TranslationPaths;
    isSortable?: boolean;
    shouldShowFn: (data: OnyxTypes.SearchResults['data']) => boolean;
};

const SearchColumns: SearchColumnConfig[] = [
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.DATE,
        translationKey: 'common.date',
        shouldShowFn: () => true,
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.MERCHANT,
        translationKey: 'common.merchant',
        shouldShowFn: (data: OnyxTypes.SearchResults['data']) => SearchUtils.getShouldShowMerchant(data),
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.DESCRIPTION,
        translationKey: 'common.description',
        shouldShowFn: (data: OnyxTypes.SearchResults['data']) => !SearchUtils.getShouldShowMerchant(data),
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.FROM,
        translationKey: 'common.from',
        shouldShowFn: () => true,
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.TO,
        translationKey: 'common.to',
        shouldShowFn: () => true,
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.CATEGORY,
        translationKey: 'common.category',
        shouldShowFn: (data: OnyxTypes.SearchResults['data']) => SearchUtils.getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.CATEGORY),
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.TAG,
        translationKey: 'common.tag',
        shouldShowFn: (data: OnyxTypes.SearchResults['data']) => SearchUtils.getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAG),
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT,
        translationKey: 'common.tax',
        shouldShowFn: (data: OnyxTypes.SearchResults['data']) => SearchUtils.getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT),
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.TOTAL,
        translationKey: 'common.total',
        shouldShowFn: () => true,
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.TYPE,
        translationKey: 'common.type',
        shouldShowFn: () => true,
    },
    {
        columnName: CONST.SEARCH_TABLE_COLUMNS.ACTION,
        translationKey: 'common.action',
        isSortable: false,
        shouldShowFn: () => true,
    },
];

type SearchTableHeaderProps = {
    data: OnyxTypes.SearchResults['data'];
};

function SearchTableHeader({data}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    const [sortColumn, setSortColumn] = useState<SearchColumnConfig['columnName'] | undefined>();
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    if (displayNarrowVersion) {
        return;
    }

    const onSortPress = (columnName: SearchColumnConfig['columnName'], order: 'asc' | 'desc') => {
        setSortColumn(columnName);
        setSortOrder(order);
    };

    return (
        <View style={[styles.ph5, styles.pb3]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.ph4]}>
                {SearchColumns.map(({columnName, translationKey, shouldShowFn, isSortable}) => {
                    const isActive = sortColumn === columnName;

                    return (
                        <SortableHeaderText
                            text={translate(translationKey)}
                            sortOrder={sortOrder}
                            isActive={isActive}
                            containerStyle={[StyleUtils.getSearchTableColumnStyles(columnName)]}
                            shouldShow={shouldShowFn(data)}
                            isSortable={isSortable}
                            onPress={(order: 'asc' | 'desc') => onSortPress(columnName, order)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
