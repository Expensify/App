import React from 'react';
import {createPortal} from 'react-dom';
import {propTypes, defaultProps} from '../Popover/PopoverPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import Popover from '../Popover';
import CONST from '../../CONST';

const ContextMenuPopover = props => (!props.isSmallScreenWidth ? createPortal(
    <Popover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        type={CONST.MODAL.MODAL_TYPE.CONTEXT_MENU}
        shouldCloseOnOutsideClick
    />,
    document.body,
) : (
    <Popover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
    />
));

ContextMenuPopover.propTypes = propTypes;
ContextMenuPopover.defaultProps = defaultProps;
ContextMenuPopover.displayName = 'ContextMenuPopover';

export default withWindowDimensions(ContextMenuPopover);
