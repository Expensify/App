/**
 * On mobile, there is no concept of hovering, so we return a plain wrapper around the component's only child.
 */
import React from 'react';
import {propTypes, defaultProps} from './HoverablePropTypes';

const Hoverable = props => React.Children.only(props.children);

Hoverable.propTypes = propTypes;
Hoverable.defaultProps = defaultProps;

export default Hoverable;
