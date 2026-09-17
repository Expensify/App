import useThemeStyles from '@hooks/useThemeStyles';

import {useMemo} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {cancelAnimation, useAnimatedStyle, useSharedValue, withDecay} from 'react-native-reanimated';

import type HTMLTableScrollProps from './types';

/**
 * Native horizontal scroller for HTML tables. A plain ScrollView rendered inside react-native-render-html never wins the
 * pan on native, and a gesture-handler ScrollView can only ever claim one axis (blocking the chat's vertical scroll).
 * This custom pan scrolls the table horizontally while activeOffsetX/failOffsetY let vertical drags fall through to the
 * chat's vertical scroll.
 */
function HTMLTableScroll({viewportWidth, contentWidth, children}: HTMLTableScrollProps) {
    const styles = useThemeStyles();
    const maxScroll = Math.max(0, contentWidth - viewportWidth);

    const translateX = useSharedValue(0);
    const panGesture = useMemo(
        () =>
            Gesture.Pan()
                .activeOffsetX([-10, 10])
                .failOffsetY([-10, 10])
                .onBegin(() => {
                    cancelAnimation(translateX);
                })
                .onChange((event) => {
                    translateX.set(Math.min(0, Math.max(-maxScroll, translateX.get() + event.changeX)));
                })
                .onEnd((event) => {
                    translateX.set(withDecay({velocity: event.velocityX, clamp: [-maxScroll, 0]}));
                }),
        [maxScroll, translateX],
    );

    const animatedStyle = useAnimatedStyle(() => ({transform: [{translateX: translateX.get()}]}));

    return (
        <View style={[styles.htmlTable, {width: viewportWidth}]}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{width: contentWidth}, animatedStyle]}>{children}</Animated.View>
            </GestureDetector>
        </View>
    );
}

export default HTMLTableScroll;
