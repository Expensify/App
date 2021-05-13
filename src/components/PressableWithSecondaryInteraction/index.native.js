import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';

const propTypes = {
    // The function that should be called when this pressable is LongPressed or right-clicked.
    onSecondaryInteraction: PropTypes.func.isRequired,

    // The children which should be contained in this wrapper component.
    children: PropTypes.node.isRequired,
};

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 * @returns {React.Component}
 */
const PressableWithSecondaryInteraction = ({onSecondaryInteraction, children, ...props}) => (
    <Pressable
        onLongPress={(e) => {
            e.preventDefault();
            onSecondaryInteraction(e);
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(_.omit(props, 'onLongPress'))}
    >
        {children}
    </Pressable>
);

PressableWithSecondaryInteraction.propTypes = propTypes;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default PressableWithSecondaryInteraction;
