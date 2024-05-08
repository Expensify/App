import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

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
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.DATE)]}>
                    <Text style={[styles.mutedNormalTextLabel]}>{translate('common.date')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.MERCHANT)]}>
                    <Text style={[styles.mutedNormalTextLabel]}>{translate(shouldShowMerchant ? 'common.merchant' : 'common.description')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.FROM)]}>
                    <Text style={[styles.mutedNormalTextLabel]}>{translate('common.from')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TO)]}>
                    <Text style={[styles.mutedNormalTextLabel]}>{translate('common.to')}</Text>
                </View>
                {shouldShowCategoryColumn && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.CATEGORY)]}>
                        <Text style={[styles.mutedNormalTextLabel]}>{translate('common.category')}</Text>
                    </View>
                )}
                {shouldShowTagColumn && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAG)]}>
                        <Text style={[styles.mutedNormalTextLabel]}>{translate('common.tag')}</Text>
                    </View>
                )}
                {!shouldShowTaxColumn && (
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TAX_AMOUNT)]}>
                        <Text style={[styles.mutedNormalTextLabel]}>{translate('common.tax')}</Text>
                    </View>
                )}
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>
                    <Text style={[styles.mutedNormalTextLabel]}>{translate('common.total')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TYPE)]}>
                    <Text style={[styles.mutedNormalTextLabel]}>{translate('common.type')}</Text>
                </View>
                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>
                    <Text style={[styles.mutedNormalTextLabel, styles.textAlignCenter]}>{translate('common.action')}</Text>
                </View>
            </View>
        </View>
    );
}

SearchTableHeader.displayName = 'SearchTableHeader';

export default SearchTableHeader;
