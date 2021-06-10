import _ from 'underscore';
import React from 'react';
import {createPortal} from 'react-dom';
import {propTypes, defaultProps as defaultPopoverProps} from '../Popover/PopoverPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import Popover from '../Popover';
import CONST from '../../CONST';

const defaultProps = {
    ...(_.omit(defaultPopoverProps, 'type')),
};

const ContextMenuPopover = props => (!props.isSmallScreenWidth ? createPortal(
    <Popover
        type={CONST.MODAL.MODAL_TYPE.CONTEXT_MENU}
        shouldCloseOnOutsideClick
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />,
    document.body,
) : (
    <Popover
        type={CONST.MODAL.MODAL_TYPE.CONTEXT_MENU}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
));

ContextMenuPopover.propTypes = propTypes;
ContextMenuPopover.defaultProps = defaultProps;
ContextMenuPopover.displayName = 'ContextMenuPopover';

export default withWindowDimensions(ContextMenuPopover);
