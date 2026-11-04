import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {WisePaymentSummaryProps} from './types';

import WisePaymentSummaryHeader from './components/WisePaymentSummaryHeader';

/** The report and the amounts of a Wise payment, shown before Pay and in the payment details afterwards */
function WisePaymentSummary({reportID, rows}: WisePaymentSummaryProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.borderedContentCard, styles.p4, styles.gap3]}>
            <WisePaymentSummaryHeader reportID={reportID} />
            {rows.map(({label, value}) => (
                <View
                    key={label}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}
                >
                    <Text style={styles.flexShrink1}>{label}</Text>
                    <Text variant="textStrong">{value}</Text>
                </View>
            ))}
        </View>
    );
}

export default WisePaymentSummary;
