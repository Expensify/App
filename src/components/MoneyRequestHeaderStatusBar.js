import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import useLocalize from '../hooks/useLocalize';
import Text from './Text';

function MoneyRequestHeaderStatusBar() {
    const {translate} = useLocalize();

    return (
        <View
            style={[
                styles.dFlex,
                styles.flexRow,
                styles.alignItemsCenter,
                styles.flexGrow1,
                styles.justifyContentBetween,
                styles.overflowHidden,
                styles.ph5,
                styles.pv3,
                styles.borderBottom,
                styles.w100,
            ]}
        >
            <View style={[styles.moneyRequestHeaderStatusBarBadge]}>
                <Text style={[styles.textStrong, styles.textLabel]}>{translate('iou.receiptStatusTitle')}</Text>
            </View>
            <View style={[styles.flexShrink1]}>
                <Text style={[styles.textLabelSupporting]}>{translate('iou.receiptStatusText')}</Text>
            </View>
        </View>
    );
}

MoneyRequestHeaderStatusBar.displayName = 'MoneyRequestHeaderStatusBar';

export default MoneyRequestHeaderStatusBar;
