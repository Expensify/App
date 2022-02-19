import _ from 'underscore';
import React, {forwardRef} from 'react';
import {Pressable} from 'react-native';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';
import Text from '../Text';
import HapticFeedback from '../../libs/HapticFeedback';

/**
 * Triggers haptic feedback, and calls onSecondaryInteraction
 *
 * @param {GestureResponderEvent} event
 * @param {Object} props
 */
function handleLongPress(event, props) {
    event.preventDefault();
    HapticFeedback.trigger();
    props.onSecondaryInteraction(event);
}

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 *
 * @param {Object} props
 * @returns {React.Component}
 */
const PressableWithSecondaryInteraction = (props) => {
    // Use Text node for inline mode to prevent content overflow.
    const Node = props.inline ? Text : Pressable;
    return (
        <Node
            ref={props.forwardedRef}
            onPress={props.onPress}
            onPressIn={props.onPressIn}
            onLongPress={event => handleLongPress(event, props)}
            onPressOut={props.onPressOut}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(_.omit(props, 'onLongPress'))}
        >
            {props.children}
        </Node>
    );
};

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
