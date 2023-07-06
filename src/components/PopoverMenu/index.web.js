import React, {forwardRef} from 'react';
import BasePopoverMenu from './BasePopoverMenu';
import {propTypes, defaultProps} from './popoverMenuPropTypes';

const PopoverMenu = forwardRef((props, ref) => (
    <BasePopoverMenu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldNavigateBeforeClosingModal
    />
));

PopoverMenu.propTypes = propTypes;
PopoverMenu.defaultProps = defaultProps;
PopoverMenu.displayName = 'PopoverMenu';

export default PopoverMenu;
