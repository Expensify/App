import React, {forwardRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, ScrollView} from 'react-native';
import Reanimated, {
    Easing,
    KeyboardState,
    useAnimatedKeyboard,
    useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {popoverHeightSharedValue} from '../../../Expensify';

const ReportKeyboardSpace = forwardRef((props, ref) => {
    const safeArea = useSafeAreaInsets();
    const keyboard = useAnimatedKeyboard();
    const keyboardSpaceState = useSharedValue(null);
    const windowHeight = Dimensions.get('screen').height;

    useImperativeHandle(ref, () => ({
        setState(measurements, keyboardVisible) {
            setTimeout(() => {
                keyboardSpaceState.value = {
                    measurements,
                    keyboardVisible,
                    keyboardHeight: keyboard.height.value,
                };
            }, 100);
        },
        reset() {
            setTimeout(() => {
                popoverHeightSharedValue.value = 0;
            }, 100);
            setTimeout(() => {
                keyboardSpaceState.value = null;
            }, 450);
        },
    }));

    const config = {
        duration: 350,
        easing: Easing.bezier(0.33, 0.01, 0, 1),
    };

    const animatedStyle = useAnimatedStyle(() => {
        if (keyboardSpaceState.value == null) {
            return {
                height: 0,
            };
        }

        const {measurements, keyboardVisible, keyboardHeight} = keyboardSpaceState.value;

        if (!keyboardVisible) {
            // this means the bottom sheet was opened when the keyboard was closed
            const offset = popoverHeightSharedValue.value
              - (windowHeight - measurements.fy)
              + measurements.height
              + safeArea.top + safeArea.bottom;

            return {
                height: withTiming(offset < 0 ? 0 : offset, config),
            };
        }

        const invertedHeight = keyboard.state.value === KeyboardState.CLOSED
            ? keyboardHeight - safeArea.bottom
            : 0;

        const offset = popoverHeightSharedValue.value
          - (windowHeight - measurements.fy)
          + measurements.height
          + keyboardHeight
          + safeArea.bottom
          + 10;

        if (keyboard.state.value === KeyboardState.CLOSED && offset > invertedHeight) {
            return {
                // we need set the value to the current offset before running the animation
                // but also it should happen only once
                height: !global.spacer_shouldRunSpring
                    ? (() => {
                        global.spacer_shouldRunSpring = true;
                        return invertedHeight;
                    })()
                    : withTiming(offset < 0 ? 0 : offset, config, () => {
                        global.spacer_shouldRunSpring = false;
                    }),
            };
        }
        return {
            height: invertedHeight,
        };
    });

    return <Reanimated.View style={[animatedStyle]} />;
});

ReportKeyboardSpace.displayName = 'ReportKeyboardSpace';

export default function ActionSheetAwareScrollView(props) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <ScrollView {...props}>
            <ReportKeyboardSpace ref={props.keyboardSpacerRef} />
            {props.children}
        </ScrollView>
    );
}

ActionSheetAwareScrollView.propTypes = {
    children: PropTypes.node.isRequired,
    keyboardSpacerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
        .isRequired,
};

