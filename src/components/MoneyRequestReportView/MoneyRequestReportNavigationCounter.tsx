import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getWidestNumberWithSameDigitCount} from '@libs/NumberUtils';

import React from 'react';
import {View} from 'react-native';

type MoneyRequestReportNavigationCounterProps = {
    /** 1-based position of the item currently shown */
    current: number;

    /** Total number of items the counter can page through */
    total: number;
};

function MoneyRequestReportNavigationCounter({current, total}: MoneyRequestReportNavigationCounterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View>
            {/* Invisible copy of the widest label this counter can show. It reserves a fixed width so the label doesn't
                shift sideways as the user pages, and the real label is drawn over it, right-aligned against the arrows. */}
            <Text
                style={[styles.mutedTextLabel, styles.opacity0]}
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                {translate('common.currentOfTotal', {current: getWidestNumberWithSameDigitCount(Math.max(current, total)), total})}
            </Text>
            <Text style={[styles.mutedTextLabel, styles.textAlignRight, styles.pAbsolute, styles.t0, styles.r0]}>{translate('common.currentOfTotal', {current, total})}</Text>
        </View>
    );
}

export default MoneyRequestReportNavigationCounter;
