import _ from 'underscore';
import React, {forwardRef} from 'react';
import * as Haptics from 'expo-haptics';
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
        onPress={props.onPress}
        onPressIn={props.onPressIn}
        delayLongPress={200}
        onLongPress={(e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {
                props.onSecondaryInteraction(e);
            });
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
