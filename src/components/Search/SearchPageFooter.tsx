import React, {useMemo} from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type SearchPageFooterProps = {
    count: number | undefined;
    total: number | undefined;
    currency: string | undefined;
};

function SearchPageFooter({count, total, currency}: SearchPageFooterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const platform = getPlatform(true);
    // We want to prevent the floating camera button from covering the totals
    const shouldShowFloatingCameraButton = platform !== CONST.PLATFORM.WEB && platform !== CONST.PLATFORM.DESKTOP;

    const valueTextStyle = useMemo(() => (isOffline ? [styles.textLabelSupporting, styles.labelStrong] : [styles.labelStrong]), [isOffline, styles]);

    return (
        <View
            style={[
                shouldShowFloatingCameraButton ? styles.justifyContentStart : styles.justifyContentEnd,
                styles.borderTop,
                styles.ph5,
                styles.pv3,
                styles.flexRow,
                styles.gap3,
                StyleUtils.getBackgroundColorStyle(theme.appBG),
            ]}
        >
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.expenses')}:`}</Text>
                <Text style={valueTextStyle}>{count}</Text>
            </View>
            <View style={[styles.flexRow, styles.gap1]}>
                <Text style={styles.textLabelSupporting}>{`${translate('common.totalSpend')}:`}</Text>
                <Text style={valueTextStyle}>{convertToDisplayString(total, currency)}</Text>
            </View>
        </View>
    );
}

SearchPageFooter.displayName = 'SearchPageFooter';

export default SearchPageFooter;
