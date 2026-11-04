/**
 * The "X of Y" label shown next to the prev/next arrows in the report and expense headers.
 */
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

/**
 * Expensify Neue has proportional figures. Its widest digit is 0 and its widest non-zero digit is 8, so a position written
 * as 8 followed by 0s (80, 800, ...) is the widest one with that many digits. Positions never start with 0.
 */
const WIDEST_LEADING_DIGIT = '8';
const WIDEST_DIGIT = '0';

type CarouselCounterProps = {
    /** 1-based position of the item being viewed */
    current: number;

    /** Number of items the user can page through */
    total: number;
};

function CarouselCounter({current, total}: CarouselCounterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // We can't use `fontVariant: ['tabular-nums']` to keep the label from shifting as the user pages, because the font's
    // tabular 1 has a serif. Instead, an invisible copy of the widest label this carousel can show sets the width, and
    // the real label is drawn over it, right-aligned against the arrows.
    const widestCurrent = Number(WIDEST_LEADING_DIGIT + WIDEST_DIGIT.repeat(String(total).length - 1));

    return (
        <View>
            <Text
                style={[styles.mutedTextLabel, styles.opacity0]}
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
            >
                {translate('common.currentOfTotal', {current: widestCurrent, total})}
            </Text>
            <Text style={[styles.mutedTextLabel, styles.textAlignRight, styles.pAbsolute, styles.t0, styles.r0]}>{translate('common.currentOfTotal', {current, total})}</Text>
        </View>
    );
}

export default CarouselCounter;
export type {CarouselCounterProps};
