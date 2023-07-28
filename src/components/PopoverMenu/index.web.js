import React, {forwardRef} from 'react';
import BasePopoverMenu from './BasePopoverMenu';
import {propTypes, defaultProps} from './popoverMenuPropTypes';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const PopoverMenu = forwardRef((props, ref) => {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <BasePopoverMenu
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            shouldNavigateBeforeClosingModal={isSmallScreenWidth}
        />
    );
});

PopoverMenu.propTypes = propTypes;
PopoverMenu.defaultProps = defaultProps;
PopoverMenu.displayName = 'PopoverMenu';

export default PopoverMenu;
