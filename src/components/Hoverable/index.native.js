import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import {propTypes, defaultProps} from './HoverablePropTypes';

/**
 * On mobile, there is no concept of hovering, so we return a plain wrapper around the component's children,
 * where the hover state is always false.
 *
 * @param {Object} props
 * @returns {React.Component}
 */
const Hoverable = (props) => {
    const childrenWithHoverState = _.isFunction(props.children)
        ? props.children(false)
        : props.children;
    return <View>{childrenWithHoverState}</View>;
};

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
