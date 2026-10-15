import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';

import {Portal} from '@gorhom/portal';
import React, {useEffect, useRef} from 'react';
import {DeviceEventEmitter, View} from 'react-native';

import type ChartTooltipAnchorProps from './types';

/** Zero-size view pinned to the chart's top-left corner, which reports where the chart sits in the window when the tooltip shows and after each scroll */
function ChartTooltipAnchor({isShown, onOriginChange}: ChartTooltipAnchorProps) {
    const styles = useThemeStyles();
    const anchorRef = useRef<ComponentRef<typeof View>>(null);
    const hostOriginRef = useRef<ComponentRef<typeof View>>(null);

    useEffect(() => {
        if (!isShown) {
            return;
        }

        // Measured against the portal host the tooltip is drawn in, since on Android the window coordinates can leave out the status bar
        const measureOrigin = () => hostOriginRef.current?.measureInWindow((hostX, hostY) => anchorRef.current?.measureInWindow((x, y) => onOriginChange(x - hostX, y - hostY)));
        measureOrigin();

        // Native views can't be observed while they move, so the position is measured again once the scroll ends
        const scrollingListener = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (isScrolling: boolean) => {
            if (isScrolling) {
                return;
            }
            measureOrigin();
        });
        return () => scrollingListener.remove();
    }, [isShown, onOriginChange]);

    return (
        <>
            <View
                ref={anchorRef}
                style={styles.chartTooltipOrigin}
                pointerEvents="none"
            />
            <Portal>
                <View
                    ref={hostOriginRef}
                    style={styles.chartTooltipOrigin}
                    pointerEvents="none"
                />
            </Portal>
        </>
    );
}

export default ChartTooltipAnchor;
