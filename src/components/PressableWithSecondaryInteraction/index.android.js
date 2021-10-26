import _ from 'underscore';
import React, {forwardRef} from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Pressable, Platform} from 'react-native';
import {propTypes, defaultProps} from './pressableWithSecondaryInteractionPropTypes';

/**
 * Triggers haptic feedback, and calls onSecondaryInteraction
 * 
 * @param {Object} event
 * @param {Object} props 
 */
function handleLongPress(event, props) {
    event.preventDefault();
    props.onSecondaryInteraction(event);

    if(Platform.Version >= 29) {
        ReactNativeHapticFeedback.trigger('effectHeavyClick');
    } else {
        ReactNativeHapticFeedback.trigger('keyboardTap');
    }
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
        delayLongPress={200}
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
