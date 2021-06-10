import React from 'react';
import {propTypes, defaultProps} from '../Popover/PopoverPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import Popover from '../Popover';

/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
const ContextMenuPopover = props => (
    <Popover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

ContextMenuPopover.propTypes = propTypes;
ContextMenuPopover.defaultProps = defaultProps;
ContextMenuPopover.displayName = 'ContextMenuPopover';

export default withWindowDimensions(ContextMenuPopover);
