import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming} from 'react-native-reanimated';

function ReceiptScanningLine() {
    const styles = useThemeStyles();
    const top = useSharedValue(0);

    useEffect(() => {
        top.set(
            withRepeat(
                withTiming(100, {
                    duration: CONST.RECEIPT.TRANSLATION_SCAN_DURATION,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true,
            ),
        );
        return () => cancelAnimation(top);
    }, [top]);

    const animatedStyle = useAnimatedStyle(() => ({
        top: `${top.get()}%`,
    }));

    // TODO: The line spans the whole attachment area. Fit it to the image bounds once design confirms the look.
    return (
        <View style={[StyleSheet.absoluteFill, styles.pointerEventsNone, styles.overflowHidden]}>
            <Animated.View style={[styles.receiptScanningLine, animatedStyle]} />
        </View>
    );
}

export default ReceiptScanningLine;
