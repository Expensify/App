/**
 * On mobile, there is no concept of hovering, so we return a plain wrapper around the component's only child.
 */
import React from 'react';
import {propTypes, defaultProps} from './HoverablePropTypes';

// Simply render the children, ignoring all other `Hoverable` props.
// Using React.Children.only enforces that only a single child element is provided,
// which matches the desired interface of `Hoverable` on web/desktop.
const Hoverable = props => React.Children.only(props.children);

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
