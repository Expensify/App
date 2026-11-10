import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type WisePaymentSummaryRowProps = {
    label: string;
    value: string;
};

function WisePaymentSummaryRow({label, value}: WisePaymentSummaryRowProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
            <Text style={styles.flexShrink1}>{label}</Text>
            <Text variant="textStrong">{value}</Text>
        </View>
    );
}

export default WisePaymentSummaryRow;
