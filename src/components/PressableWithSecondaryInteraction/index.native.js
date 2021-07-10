import _ from 'underscore';
import React, {forwardRef} from 'react';
import {Pressable} from 'react-native';
import * as Haptics from 'expo-haptics';
import pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';

const defaultProps = {
    forwardedRef: () => {},
};

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 *
 * @param {Object} props
 * @returns {React.Component}
 */
const PressableWithSecondaryInteraction = props => (
    <Pressable
        ref={props.forwardedRef}
        onLongPress={(e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {
                props.onSecondaryInteraction(e);
            });
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(_.omit(props, 'onLongPress'))}
    >
        {props.children}
    </Pressable>
);

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes;
PressableWithSecondaryInteraction.defaultProps = defaultProps;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
