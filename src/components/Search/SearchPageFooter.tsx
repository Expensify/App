import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

type SearchPageFooterProps = {
    metadata: SearchResultsInfo;
};

function SearchPageFooter({metadata}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const containerStyle = useMemo(() => {
        if (isOffline && shouldUseNarrowLayout) {
            return [styles.justifyContentStart, styles.borderTop, styles.ph5, styles.pv3, styles.flexRow, styles.gap3, StyleUtils.getBackgroundColorStyle(theme.appBG)];
        }
        return [styles.justifyContentEnd, styles.borderTop, styles.ph5, styles.pv3, styles.flexRow, styles.gap3, StyleUtils.getBackgroundColorStyle(theme.appBG)];
    }, [shouldUseNarrowLayout, isOffline, StyleUtils, styles, theme]);

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);

    return (
        <View style={containerStyle}>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.expenses')}:`}</Text>
                <Text style={valueTextStyle}>{metadata.count}</Text>
            </View>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.totalSpend')}:`}</Text>
                <Text style={valueTextStyle}>{convertToDisplayString(metadata.total, metadata.currency)}</Text>
            </View>
        </View>
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
