import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';

import type {LayoutChangeEvent} from 'react-native';

import React, {useEffect, useId, useState} from 'react';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

import Image from './Image';
import RESIZE_MODES from './Image/resizeModes';

type ReceiptScanningLineProps = {
    /** Receipt image being translated */
    imageUri: string;

    /** Whether the image needs the auth token to load */
    isAuthTokenRequired?: boolean;
};

/** Shows the receipt image with a scanning line moving over it while the receipt is translated */
function ReceiptScanningLine({imageUri, isAuthTokenRequired}: ReceiptScanningLineProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const gradientID = useId();
    const progress = useSharedValue(0);
    const [containerSize, setContainerSize] = useState<Dimensions>({width: 0, height: 0});
    const [imageSize, setImageSize] = useState<Dimensions>({width: 0, height: 0});

    useEffect(() => {
        progress.set(
            withRepeat(
                withTiming(1, {
                    duration: CONST.RECEIPT.TRANSLATION_SCAN_DURATION,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true,
            ),
        );
        return () => cancelAnimation(progress);
    }, [progress]);

    // The image is drawn with "contain", so the line has to match where the image actually lands inside the container
    let displayWidth = 0;
    let displayHeight = 0;
    if (containerSize.width && containerSize.height && imageSize.width && imageSize.height) {
        const imageAspectRatio = imageSize.width / imageSize.height;
        if (imageAspectRatio > containerSize.width / containerSize.height) {
            displayWidth = containerSize.width;
            displayHeight = containerSize.width / imageAspectRatio;
        } else {
            displayHeight = containerSize.height;
            displayWidth = containerSize.height * imageAspectRatio;
        }
    }

    const animatedStyle = useAnimatedStyle(() => ({
        top: progress.get() * (displayHeight - CONST.RECEIPT.TRANSLATION_SCAN_LINE_HEIGHT),
    }));

    const onContainerLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        setContainerSize({width, height});
    };

    const onImageLoad = (event: {nativeEvent: {width: number; height: number}}) => {
        const {width, height} = event.nativeEvent;
        if (!width || !height) {
            return;
        }
        setImageSize({width, height});
    };

    return (
        <View
            style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
            onLayout={onContainerLayout}
        >
            {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
            <Image
                source={{uri: imageUri}}
                resizeMode={RESIZE_MODES.contain}
                style={[styles.h100, styles.w100]}
                onLoad={onImageLoad}
                isAuthTokenRequired={isAuthTokenRequired}
            />
            {!!displayHeight && (
                <View
                    pointerEvents="none"
                    style={[styles.pAbsolute, styles.overflowHidden, StyleUtils.getWidthAndHeightStyle(displayWidth, displayHeight)]}
                >
                    <Animated.View style={[styles.receiptScanningLine, animatedStyle]}>
                        <Svg
                            width="100%"
                            height="100%"
                        >
                            <Defs>
                                <LinearGradient
                                    id={gradientID}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <Stop
                                        offset="0"
                                        stopColor={theme.success}
                                        stopOpacity={CONST.RECEIPT.TRANSLATION_SCAN_TINT_OPACITY}
                                    />
                                    <Stop
                                        offset="1"
                                        stopColor={theme.success}
                                        stopOpacity="0"
                                    />
                                </LinearGradient>
                            </Defs>
                            <Rect
                                width="100%"
                                height="100%"
                                fill={`url(#${gradientID})`}
                            />
                        </Svg>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

export default ReceiptScanningLine;
