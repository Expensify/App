import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type SearchTableHeaderProps = {
    /** Whether we should show the merchant or description column */
    shouldShowMerchant: boolean;
};

function SearchTableHeader({shouldShowMerchant}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    if (displayNarrowVersion) {
        return;
    }

    return (
        <View style={[styles.ph5, styles.pb3]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.ph4]}>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.RECEIPT)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate('common.receipt')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate('common.date')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate(shouldShowMerchant ? 'common.merchant' : 'common.description')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate('common.from')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TO)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate('common.to')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate('common.total')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>
                    <Text style={[styles.textMicroSupporting]}>{translate('common.type')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>
                    <Text style={[styles.textMicroSupporting, styles.textAlignCenter]}>{translate('common.action')}</Text>
                </View>
            </View>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
