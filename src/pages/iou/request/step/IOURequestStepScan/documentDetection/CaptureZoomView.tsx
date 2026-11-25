/** Zooms the camera view onto the detected receipt while a capture is processed, so the receipt fills the screen. */
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import type {DocumentEdge} from './types';

const ZOOM_DURATION_MS = 250;

const ZOOM_FILL_SHARE = 0.9;

const MAX_ZOOM = 2.5;

type ZoomBox = {
    centerX: number;
    centerY: number;
    width: number;
    height: number;
};

type CaptureZoomViewProps = {
    /** Zooms to where the outline was when this turned true, and back out when it turns false */
    isZoomed: boolean;

    /** The live outline, in the camera view's points. Without one there is nothing to zoom to */
    edge: SharedValue<DocumentEdge | null> | undefined;

    children: ReactNode;
};

function getZoomBox(edge: DocumentEdge | null | undefined): ZoomBox | null {
    if (!edge?.length) {
        return null;
    }
    const xs = edge.map((point) => point.x);
    const ys = edge.map((point) => point.y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    return {
        centerX: (left + right) / 2,
        centerY: (top + bottom) / 2,
        width: right - left,
        height: bottom - top,
    };
}

function CaptureZoomView({isZoomed, edge, children}: CaptureZoomViewProps) {
    const styles = useThemeStyles();
    const progress = useSharedValue(0);
    const box = useSharedValue<ZoomBox | null>(null);
    const size = useSharedValue({width: 0, height: 0});

    useEffect(() => {
        if (!isZoomed) {
            progress.set(0);
            return;
        }
        box.set(getZoomBox(edge?.get()));
        progress.set(
            withTiming(1, {
                duration: ZOOM_DURATION_MS,
                easing: Easing.out(Easing.cubic),
            }),
        );
    }, [isZoomed, edge, box, progress]);

    const zoomStyle = useAnimatedStyle(() => {
        const target = box.get();
        const {width, height} = size.get();
        if (!target || !width || !height || !target.width || !target.height) {
            return {
                transform: [{translateX: 0}, {translateY: 0}, {scale: 1}],
            };
        }
        const zoom = Math.min(MAX_ZOOM, ZOOM_FILL_SHARE * Math.min(width / target.width, height / target.height));
        const scale = 1 + (Math.max(1, zoom) - 1) * progress.get();
        return {
            transform: [{translateX: (width / 2 - target.centerX) * scale * progress.get()}, {translateY: (height / 2 - target.centerY) * scale * progress.get()}, {scale}],
        };
    });

    const updateSize = (event: LayoutChangeEvent) => {
        size.set({
            width: event.nativeEvent.layout.width,
            height: event.nativeEvent.layout.height,
        });
    };

    return (
        <Animated.View
            style={[styles.flex1, styles.overflowHidden]}
            onLayout={updateSize}
        >
            <Animated.View style={[styles.flex1, zoomStyle]}>{children}</Animated.View>
        </Animated.View>
    );
}

export default CaptureZoomView;
