import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import TextPill from '@components/TextPill';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function HoldBanner() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    //test
    return (
        <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pb3, styles.ph5, styles.borderBottom]}>
            <TextPill>{translate('iou.hold')}</TextPill>
            <Text style={[styles.textLabel, styles.pl3, styles.mw100, styles.flexShrink1]}>{translate('iou.requestOnHold')}</Text>
        </View>
    );
}

HoldBanner.displayName = 'HoldBanner';

export default HoldBanner;
