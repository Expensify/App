import _ from 'underscore';
import React, {forwardRef} from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Pressable, Platform} from 'react-native';
import {propTypes, defaultProps} from './pressableWithSecondaryInteractionPropTypes';

/**
 * Triggers haptic feedback, and calls onSecondaryInteraction
 *
 * @param {GestureResponderEvent} event
 * @param {Object} props
 */
function handleLongPress(event, props) {
    event.preventDefault();
    props.onSecondaryInteraction(event);

    // The constant effectHeavyClick is added in API level 29.
    // Docs: https://developer.android.com/reference/android/os/VibrationEffect#EFFECT_HEAVY_CLICK
    // We use keyboardTap added in API level 8 as a fallback.
    // Docs: https://developer.android.com/reference/android/view/HapticFeedbackConstants#KEYBOARD_TAP
    if (Platform.Version >= 29) {
        ReactNativeHapticFeedback.trigger('effectHeavyClick');
        return;
    }
    ReactNativeHapticFeedback.trigger('keyboardTap');
}

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 *
 * @param {Object} props
 * @returns {React.Component}
 */
const PressableWithSecondaryInteraction = props => (
    <Pressable
        ref={props.forwardedRef}
        onPress={props.onPress}
        onPressIn={props.onPressIn}
        onLongPress={event => handleLongPress(event, props)}
        onPressOut={props.onPressOut}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(_.omit(props, 'onLongPress'))}
    >
        {props.children}
    </Pressable>
);

PressableWithSecondaryInteraction.propTypes = propTypes;
PressableWithSecondaryInteraction.defaultProps = defaultProps;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
