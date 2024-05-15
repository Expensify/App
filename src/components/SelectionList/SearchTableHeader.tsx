import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import SearchTableHeaderColumn from './SearchTableHeaderColumn';

type SearchTableHeaderProps = {
    data: OnyxTypes.SearchResults['data'];
};

function SearchTableHeader({data}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    const shouldShowCategoryColumn = SearchUtils.getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.CATEGORY);
    const shouldShowTagColumn = SearchUtils.getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAG);
    const shouldShowTaxColumn = SearchUtils.getShouldShowColumn(data, CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT);
    const shouldShowMerchant = SearchUtils.getShouldShowMerchant(data);

    if (displayNarrowVersion) {
        return;
    }

    return (
        <View style={[styles.ph5, styles.pb3]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.ph4]}>
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}
                    text={translate('common.date')}
                />
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}
                    text={translate(shouldShowMerchant ? 'common.merchant' : 'common.description')}
                />
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}
                    text={translate('common.from')}
                />
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TO)]}
                    text={translate('common.to')}
                />
                <SearchTableHeaderColumn
                    shouldShow={shouldShowCategoryColumn}
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.CATEGORY)]}
                    text={translate('common.category')}
                />
                <SearchTableHeaderColumn
                    shouldShow={shouldShowTagColumn}
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAG)]}
                    text={translate('common.tag')}
                />
                <SearchTableHeaderColumn
                    shouldShow={shouldShowTaxColumn}
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT)]}
                    text={translate('common.tax')}
                />
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}
                    text={translate('common.total')}
                />
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}
                    text={translate('common.type')}
                />
                <SearchTableHeaderColumn
                    containerStyle={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}
                    text={translate('common.action')}
                    textStyle={styles.textAlignCenter}
                />
            </View>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
