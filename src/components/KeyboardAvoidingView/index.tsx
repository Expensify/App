/* eslint-disable react/prop-types */
import React, {forwardRef, useCallback} from 'react';
import {StyleSheet, View, LayoutRectangle, ViewProps} from 'react-native';
import Reanimated, {
    useAnimatedKeyboard,
    useAnimatedStyle,
    useWorkletCallback,
    runOnUI,
    useSharedValue,
} from 'react-native-reanimated';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import KeyboardAvoidingViewProps from './types';

/**
 * View that moves out of the way when the keyboard appears by automatically
 * adjusting its height, position, or bottom padding.
 */
const KeyboardAvoidingView = forwardRef<View, KeyboardAvoidingViewProps>(({behavior, children, contentContainerStyle, enabled = true, keyboardVerticalOffset = 0, style, onLayout, ...props}, ref) => {
    const initialFrame = useSharedValue<LayoutRectangle | null>(null);
    const currentFrame = useSharedValue<LayoutRectangle | null>(null);

    const keyboard = useAnimatedKeyboard();
    const {windowHeight} = useWindowDimensions();

    const onLayoutWorklet = useWorkletCallback((layout: LayoutRectangle) => {
        if (initialFrame.value == null) {
            initialFrame.value = layout;
        }

        currentFrame.value = layout;
    });

    const handleOnLayout = useCallback<NonNullable<ViewProps['onLayout']>>(
        (event) => {
            runOnUI(onLayoutWorklet)(event.nativeEvent.layout);

            if (onLayout) {
                onLayout(event);
            }
        },
        [onLayout, onLayoutWorklet],
    );

    const getBackwardCompatibleHeight = useWorkletCallback((keyboardHeight: number) => {
        if (currentFrame.value == null || initialFrame.value == null) {
            return 0;
        }

        const keyboardY = windowHeight - keyboardHeight - keyboardVerticalOffset;

        if (behavior === 'height') {
            return Math.max(keyboardHeight + currentFrame.value.y + currentFrame.value.height - keyboardY - initialFrame.value.height, 0);
        }

        return Math.max(currentFrame.value.y + currentFrame.value.height - keyboardY, 0);
    });

    const animatedStyle = useAnimatedStyle(() => {
        const keyboardHeight = keyboard.height.value;

        const bottom = getBackwardCompatibleHeight(keyboardHeight);

        // we use `enabled === true` to be 100% compatible with original implementation
        const bottomHeight = enabled === true ? bottom : 0;

        switch (behavior) {
            case 'height':
                if (bottomHeight > 0) {
                    return {
                        height: bottomHeight,
                        flex: 0,
                    };
                }

                return {
                    flex: 0,
                };

            case 'position':
                return {
                    bottom: bottomHeight,
                };

            case 'padding':
                return {paddingBottom: bottomHeight};

            default:
                return {};
        }
    });

    if (behavior === 'position') {
        return (
            <Reanimated.View
                ref={ref}
                onLayout={handleOnLayout}
                style={style}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                <Reanimated.View style={StyleSheet.compose(contentContainerStyle, animatedStyle)}>{children}</Reanimated.View>
            </Reanimated.View>
        );
    }

    return (
        <Reanimated.View
            ref={ref}
            onLayout={handleOnLayout}
            style={!behavior ? style : StyleSheet.compose(style, animatedStyle)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {children}
        </Reanimated.View>
    );
});
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
