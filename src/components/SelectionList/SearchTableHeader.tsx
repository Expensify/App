import React from 'react';
import {View} from 'react-native';
import CONST from '@src/CONST';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';

function SearchTableHeader() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;
    const showMerchantColumn = displayNarrowVersion && true;

    if (displayNarrowVersion) {
        return;
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.ph4]}>
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>{translate('common.date')}</Text>
            {showMerchantColumn && <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>{translate('common.merchant')}</Text>}
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DESCRIPTION)]}>{translate('common.description')}</Text>
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>{translate('common.from')}</Text>
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TO)]}>{translate('common.to')}</Text>
            {/* <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.category')}</Text>
            <Text style={[styles.searchInputStyle, styles.flex1]}>{translate('common.tag')}</Text> */}
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>{translate('common.total')}</Text>
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>{translate('common.type')}</Text>
            <Text style={[styles.mutedNormalTextLabel, StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>{translate('common.action')}</Text>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
