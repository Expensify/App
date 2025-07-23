import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

type SearchPageFooterProps = {
    metadata: SearchResultsInfo;
    style?: StyleProp<ViewStyle>;
};

function SearchPageFooter({metadata, style}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);

    return (
        <View style={[styles.borderTop, styles.ph5, styles.pv3, styles.justifyContentEnd, styles.flexRow, styles.gap3, StyleUtils.getBackgroundColorStyle(theme.appBG), style]}>
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
