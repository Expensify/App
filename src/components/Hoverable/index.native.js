/**
 * On mobile, there is no concept of hovering, so we return a plain wrapper around the component's children.
 */
import React from 'react';
import {propTypes, defaultProps} from './HoverablePropTypes';

// Simply render the children, ignoring all other `Hoverable` props.
const Hoverable = props => <>{props.children}</>;

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
