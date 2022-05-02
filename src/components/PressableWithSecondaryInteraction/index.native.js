import _ from 'underscore';
import React, {forwardRef} from 'react';
import {Pressable} from 'react-native';
import {LongPressGestureHandler, State} from 'react-native-gesture-handler';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';
import Text from '../Text';
import HapticFeedback from '../../libs/HapticFeedback';

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
        <LongPressGestureHandler
            onHandlerStateChange={(e) => {
                if (e.nativeEvent.state !== State.ACTIVE) {
                    return;
                }
                e.preventDefault();
                HapticFeedback.trigger();
                props.onSecondaryInteraction(e);
            }}
        >
            <Node
                ref={props.forwardedRef}
                onPress={props.onPress}
                onPressIn={props.onPressIn}
                onPressOut={props.onPressOut}
            // eslint-disable-next-line react/jsx-props-no-spreading
                {...(_.omit(props, 'onLongPress'))}
            >
                {props.children}
            </Node>
        </LongPressGestureHandler>

    );
};

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
