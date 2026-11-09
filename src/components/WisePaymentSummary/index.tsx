import DotIndicatorMessage from '@components/DotIndicatorMessage';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {WisePaymentSummaryProps} from './types';

import WisePaymentSummaryHeader from './components/WisePaymentSummaryHeader';
import WisePaymentSummaryRow from './components/WisePaymentSummaryRow';

/** The report and the amounts of a Wise payment, shown before Pay and in the payment details afterwards */
function WisePaymentSummary({reportID, report, rows, placeholderRowCount = 0, errors}: WisePaymentSummaryProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.borderedContentCard, styles.p4, styles.gap3]}>
            <WisePaymentSummaryHeader
                reportID={reportID}
                report={report}
            />
            {rows.map(({label, value}) => (
                <WisePaymentSummaryRow
                    key={label}
                    label={label}
                    value={value}
                />
            ))}
            {Array.from({length: placeholderRowCount}, (_, index) => (
                <WisePaymentSummaryRow
                    // Placeholders have no identity, they only hold space
                    // eslint-disable-next-line react/no-array-index-key
                    key={`placeholder-${index}`}
                    label=" "
                    value=" "
                />
            ))}
            {!!errors && (
                <DotIndicatorMessage
                    messages={errors}
                    type="error"
                />
            )}
        </View>
    );
}

export default WisePaymentSummary;
