import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';
import TextPill from './TextPill';

function HoldBanner() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pb3, styles.ph5, styles.borderBottom]}>
            <TextPill>{translate('violations.hold')}</TextPill>
            <Text style={[styles.textLabel, styles.pl3, styles.mw100, styles.flexShrink1]}>{translate('iou.expenseOnHold')}</Text>
        </View>
    );
}

HoldBanner.displayName = 'HoldBanner';

export default HoldBanner;
