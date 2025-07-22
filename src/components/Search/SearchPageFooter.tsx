import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

type SearchPageFooterProps = {
    metadata: SearchResultsInfo | undefined;
};

function SearchPageFooter({metadata}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    if (!metadata?.count) {
        return null;
    }

    return (
        <View style={[styles.borderTop, styles.ph5, styles.pv3, styles.justifyContentEnd, styles.flexRow, styles.gap3, StyleUtils.getBackgroundColorStyle(theme.appBG)]}>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={[styles.textLabelSupporting]}>{`${translate('common.expenses')}:`}</Text>
                <Text style={[styles.labelStrong]}>{metadata.count}</Text>
            </View>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={[styles.textLabelSupporting]}>{`${translate('common.totalSpend')}:`}</Text>
                <Text style={[styles.labelStrong]}>{convertToDisplayString(metadata.total, metadata.currency)}</Text>
            </View>
        </View>
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
