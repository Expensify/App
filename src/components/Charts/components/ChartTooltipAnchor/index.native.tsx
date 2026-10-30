import ChartTooltipPortal from '@components/Charts/components/ChartTooltipPortal';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';

import React, {useEffect, useEffectEvent, useRef} from 'react';
import {DeviceEventEmitter, View} from 'react-native';

import type ChartTooltipAnchorProps from './types';

/** Zero-size view pinned to the chart's top-left corner, which reports where the chart sits in the window when the tooltip shows and after each scroll */
function ChartTooltipAnchor({isShown, onOriginChange}: ChartTooltipAnchorProps) {
    const styles = useThemeStyles();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const hostOriginRef = useRef<ComponentRef<typeof View>>(null);
    // Measured against the portal host the tooltip is drawn in, since on Android the window coordinates can leave out the status bar
    const measureOrigin = () => hostOriginRef.current?.measureInWindow((hostX, hostY) => anchorRef.current?.measureInWindow((x, y) => onOriginChange(x - hostX, y - hostY)));
    const measureOriginAfterScroll = useEffectEvent(() => measureOrigin());

    useEffect(() => {
        if (!isShown) {
            return;
        }

        // Native views can't be observed while they move, so the position is measured again once the scroll ends
        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (isScrolling: boolean) => {
            if (isScrolling) {
                return;
            }
            measureOriginAfterScroll();
        });
        return () => scrollingListener.remove();
    }, [isShown]);

    return (
        <>
            <View
                ref={anchorRef}
                style={styles.chartTooltipOrigin}
                pointerEvents="none"
            />
            {isShown && (
                <ChartTooltipPortal>
                    <View
                        ref={hostOriginRef}
                        style={styles.chartTooltipOrigin}
                        pointerEvents="none"
                        onLayout={measureOrigin}
                    />
                </ChartTooltipPortal>
            )}
        </>
    );
}

export default ChartTooltipAnchor;
