import _ from 'underscore';
import React, {forwardRef} from 'react';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';
import Text from '../Text';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 *
 * @param {Object} props
 * @returns {React.Component}
 */
function PressableWithSecondaryInteraction(props) {
    // Use Text node for inline mode to prevent content overflow.
    const Node = props.inline ? Text : PressableWithFeedback;
    const executeSecondaryInteraction = (e) => {
        e.preventDefault();
        props.onSecondaryInteraction(e);
    };

    return (
        <Node
            ref={props.forwardedRef}
            onPress={props.onPress}
            onLongPress={props.onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            onPressIn={props.onPressIn}
            onPressOut={props.onPressOut}
            pressDimmingValue={props.activeOpacity}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, 'onLongPress')}
        >
            {props.children}
        </Node>
    );
}

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

const PressableWithSecondaryInteractionWithRef = forwardRef((props, ref) => (
    <PressableWithSecondaryInteraction
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

PressableWithSecondaryInteractionWithRef.displayName = 'PressableWithSecondaryInteractionWithRef';

export default PressableWithSecondaryInteractionWithRef;
