import React, {forwardRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import {Dimensions, ScrollView} from 'react-native';
import Reanimated, {
    Easing,
    KeyboardState,
    useAnimatedKeyboard,
    useAnimatedStyle, useDerivedValue, useSharedValue, withTiming,
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
            // we need for the keyboard to hide and popover to have its final height
            setTimeout(() => {
                keyboardSpaceState.value = {
                    measurements,
                    keyboardVisible,
                };
            }, 100);
        },
        reset() {
            // we start the animation
            setTimeout(() => {
                popoverHeightSharedValue.value = 0;
                keyboardSpaceState.value = null;
            }, 0);

            // and then wait for it to finish and reset everything
            setTimeout(() => {
            }, 16);
        },
    }));

    const config = {
        duration: 350,
        easing: Easing.bezier(0.33, 0.01, 0, 1),
    };

    const translateY = useDerivedValue(() => {
        let keyboardHeight = 0;

        // when we open modal keyboard is closed without animation and the height is 0
        // but when we close modal - it opens it again but for one frame the height is still 0
        if (keyboard.state.value === KeyboardState.OPEN && keyboard.height.value !== 0) {
            global.spacerKeyboardLastValue = keyboard.height.value;
            keyboardHeight = keyboard.height.value;
        } else {
            keyboardHeight = global.spacerKeyboardLastValue || 0;
        }

        if (keyboardSpaceState.value == null) {
            return withTiming(0, config);
        }

        const {measurements, keyboardVisible} = keyboardSpaceState.value;

        if (!keyboardVisible) {
            // this means the bottom sheet was opened when the keyboard was closed
            const offset = popoverHeightSharedValue.value
                - (windowHeight - measurements.fy - safeArea.top)
                + measurements.height;

            return withTiming(offset < 0 ? 0 : offset, config);
        }

        const invertedHeight = keyboard.state.value === KeyboardState.CLOSED
            ? keyboardHeight - safeArea.bottom
            : 0;

        const offset = popoverHeightSharedValue.value
            - (windowHeight - measurements.fy - safeArea.top)
            - safeArea.bottom
            + measurements.height
            + keyboardHeight;

        if (keyboard.state.value === KeyboardState.CLOSED && offset > invertedHeight) {
            return !global.spacer_shouldRunSpring
                ? (() => {
                    global.spacer_shouldRunSpring = true;
                    return invertedHeight;
                })()
                : withTiming(offset < 0 ? 0 : offset, config, () => {
                    global.spacer_shouldRunSpring = false;
                });
        }

        return invertedHeight;
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.value}],
    }));

    return <Reanimated.View style={[{flex: 1}, animatedStyle]} {...props} />;
});

ReportKeyboardSpace.displayName = 'ReportKeyboardSpace';

export default function ActionSheetAwareScrollView(props) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <ScrollView {...props}>
            <ReportKeyboardSpace ref={props.keyboardSpacerRef}>
                {props.children}
            </ReportKeyboardSpace>
        </ScrollView>
    );
}

ActionSheetAwareScrollView.propTypes = {
    children: PropTypes.node.isRequired,
    keyboardSpacerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
        .isRequired,
};

