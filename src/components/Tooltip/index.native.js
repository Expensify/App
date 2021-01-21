/**
 * On touch-based platforms, we don't need tooltips because there is no concept of hovering.
 * So instead we just return a plain wrapper around the component's only child.
 */
import React from 'react';

const Tooltip = props => React.Children.only(props.children);

export default Tooltip;
