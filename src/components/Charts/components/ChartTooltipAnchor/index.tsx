import useThemeStyles from '@hooks/useThemeStyles';

import {BoundsObserver} from '@react-ng/bounds-observer';
import React from 'react';
import {View} from 'react-native';

import type ChartTooltipAnchorProps from './types';

/** Zero-size view pinned to the chart's top-left corner, which reports where the chart sits in the window, also while the page scrolls or resizes */
function ChartTooltipAnchor({isShown, onOriginChange}: ChartTooltipAnchorProps) {
    const styles = useThemeStyles();

    return (
        <BoundsObserver
            enabled={isShown}
            onBoundsChange={(bounds) => onOriginChange(bounds.x, bounds.y)}
        >
            <View
                style={styles.chartTooltipOrigin}
                pointerEvents="none"
            />
        </BoundsObserver>
    );
}

export default ChartTooltipAnchor;
