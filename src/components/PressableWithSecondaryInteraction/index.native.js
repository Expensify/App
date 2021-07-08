import _ from 'underscore';
import React, {forwardRef} from 'react';
import {Pressable} from 'react-native';
import {propTypes, defaultProps} from './pressableWithSecondaryInteractionPropTypes';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 *
 * @param {Object} props
 * @returns {React.Component}
 */
const PressableWithSecondaryInteraction = props => (
    <Pressable
        ref={props.forwardedRef}
        onPressIn={props.onPressIn}
        onLongPress={(e) => {
            e.preventDefault();
            props.onSecondaryInteraction(e);
        }}
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
