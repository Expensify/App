import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import type {LayoutRectangle, View, ViewProps} from 'react-native';
import {useKeyboardContext, useKeyboardHandler} from 'react-native-keyboard-controller';
import Reanimated, {interpolate, runOnUI, useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {useSafeAreaFrame} from 'react-native-safe-area-context';
import type {KeyboardAvoidingViewProps} from './types';

const useKeyboardAnimation = () => {
    const {reanimated} = useKeyboardContext();

    // calculate it only once on mount, to avoid `SharedValue` reads during a render
    const [initialHeight] = useState(() => -reanimated.height.get());
    const [initialProgress] = useState(() => reanimated.progress.get());

    const heightWhenOpened = useSharedValue(initialHeight);
    const height = useSharedValue(initialHeight);
    const progress = useSharedValue(initialProgress);
    const isClosed = useSharedValue(initialProgress === 0);

    useKeyboardHandler(
        {
            onStart: (e) => {
                'worklet';

                progress.set(e.progress);
                height.set(e.height);

                if (e.height > 0) {
                    isClosed.set(false);
                    heightWhenOpened.set(e.height);
                }
            },
            onEnd: (e) => {
                'worklet';

                isClosed.set(e.height === 0);
                height.set(e.height);
                progress.set(e.progress);
            },
        },
        [],
    );

    return {height, progress, heightWhenOpened, isClosed};
};

const defaultLayout: LayoutRectangle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

/**
 * View that moves out of the way when the keyboard appears by automatically
 * adjusting its height, position, or bottom padding.
 *
 * This `KeyboardAvoidingView` acts as a backward compatible layer for the previous Android behavior (prior to edge-to-edge mode).
 * We can use `KeyboardAvoidingView` directly from the `react-native-keyboard-controller` package, but in this case animations are stuttering and it's better to handle as a separate task.
 */
const KeyboardAvoidingView = forwardRef<View, React.PropsWithChildren<KeyboardAvoidingViewProps>>(
    ({behavior, children, contentContainerStyle, enabled = true, keyboardVerticalOffset = 0, style, onLayout: onLayoutProps, ...props}, ref) => {
        const initialFrame = useSharedValue<LayoutRectangle | null>(null);
        const frame = useDerivedValue(() => initialFrame.get() ?? defaultLayout);

        const keyboard = useKeyboardAnimation();
        const {height: screenHeight} = useSafeAreaFrame();

        const relativeKeyboardHeight = useCallback(() => {
            'worklet';

            const keyboardY = screenHeight - keyboard.heightWhenOpened.get() - keyboardVerticalOffset;

            return Math.max(frame.get().y + frame.get().height - keyboardY, 0);
        }, [screenHeight, keyboard.heightWhenOpened, keyboardVerticalOffset, frame]);

        const onLayoutWorklet = useCallback(
            (layout: LayoutRectangle) => {
                'worklet';

                if (keyboard.isClosed.get() || initialFrame.get() === null) {
                    initialFrame.set(layout);
                }
            },
            [initialFrame, keyboard.isClosed],
        );
        const onLayout = useCallback<NonNullable<ViewProps['onLayout']>>(
            (e) => {
                runOnUI(onLayoutWorklet)(e.nativeEvent.layout);
                onLayoutProps?.(e);
            },
            [onLayoutProps, onLayoutWorklet],
        );

        const animatedStyle = useAnimatedStyle(() => {
            const bottom = interpolate(keyboard.progress.get(), [0, 1], [0, relativeKeyboardHeight()]);
            const bottomHeight = enabled ? bottom : 0;

            switch (behavior) {
                case 'height':
                    if (!keyboard.isClosed.get()) {
                        return {
                            height: frame.get().height - bottomHeight,
                            flex: 0,
                        };
                    }

                    return {};

                case 'padding':
                    return {paddingBottom: bottomHeight};

                default:
                    return {};
            }
        }, [behavior, enabled, relativeKeyboardHeight]);
        const combinedStyles = useMemo(() => [style, animatedStyle], [style, animatedStyle]);

        return (
            <Reanimated.View
                ref={ref}
                style={combinedStyles}
                onLayout={onLayout}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {children}
            </Reanimated.View>
        );
    },
);

export default KeyboardAvoidingView;
