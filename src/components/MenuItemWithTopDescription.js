import React from 'react';
import MenuItem from './MenuItem';
import menuItemPropTypes from './menuItemPropTypes';

const propTypes = menuItemPropTypes;

function MenuItemWithTopDescription(props) {
    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={props.forwardedRef}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
        />
    );
}

MenuItemWithTopDescription.propTypes = propTypes;
MenuItemWithTopDescription.displayName = 'MenuItemWithTopDescription';

const MenuItemWithTopDescriptionWithRef = React.forwardRef((props, ref) => (
    <MenuItemWithTopDescription
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

MenuItemWithTopDescriptionWithRef.displayName = 'MenuItemWithTopDescriptionWithRef';

export default MenuItemWithTopDescriptionWithRef;
