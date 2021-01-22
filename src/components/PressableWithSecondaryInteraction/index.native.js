/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed.
 */
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';

const propTypes = {
    onSecondaryInteraction: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

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

export default PressableWithSecondaryInteraction;
