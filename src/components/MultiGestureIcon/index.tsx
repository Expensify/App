import ImageSVG from '@components/ImageSVG';
import MultiGestureCanvas, {DEFAULT_ZOOM_RANGE} from '@components/MultiGestureCanvas';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageContentFit} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import useCanvasSize from './useCanvasSize';
import useIconCarouselPager from './useIconCarouselPager';

type MultiGestureIconProps = {
    /** The asset to render. */
    src: IconAsset | undefined;

    /** Custom width when no preset size is selected. */
    width?: number;

    /** Custom height when no preset size is selected. */
    height?: number;

    /** Fill color for the SVG. */
    fill?: string;

    /** Whether the icon is hovered. */
    hovered?: boolean;

    /** Whether the icon is pressed. */
    pressed?: boolean;

    /** Additional styles for the icon wrapper. */
    additionalStyles?: StyleProp<ViewStyle>;

    /** Test identifier for end-to-end tests. */
    testID?: string;

    /** How the SVG content should fit its container. */
    contentFit?: ImageContentFit;
};

/** Renders an icon inside a multi-gesture canvas for pinch, pan, and swipe interactions. */
function MultiGestureIcon({
    src,
    width = variables.iconSizeNormal,
    height = variables.iconSizeNormal,
    fill = undefined,
    additionalStyles = [],
    hovered = false,
    pressed = false,
    testID = '',
    contentFit = 'cover',
}: MultiGestureIconProps) {
    const {canvasSize, isCanvasLoading, updateCanvasSize} = useCanvasSize();
    const {pagerRef, isScrollEnabled, onTap, onSwipeDown} = useIconCarouselPager();

    if (!src) {
        return null;
    }

    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={updateCanvasSize}
        >
            {!isCanvasLoading && !!canvasSize && (
                <MultiGestureCanvas
                    isActive
                    canvasSize={canvasSize}
                    contentSize={{width, height}}
                    zoomRange={DEFAULT_ZOOM_RANGE}
                    pagerRef={pagerRef}
                    isUsedInCarousel={false}
                    isPagerScrollEnabled={isScrollEnabled}
                    onTap={onTap}
                    onSwipeDown={onSwipeDown}
                >
                    <View
                        testID={testID}
                        style={[additionalStyles]}
                    >
                        <ImageSVG
                            src={src}
                            width={width}
                            height={height}
                            fill={fill}
                            hovered={hovered}
                            pressed={pressed}
                            contentFit={contentFit}
                        />
                    </View>
                </MultiGestureCanvas>
            )}
        </View>
    );
}

export default MultiGestureIcon;
export type {MultiGestureIconProps};
