import React from 'react';
import menuItemPropTypes from './menuItemPropTypes';
import MenuItem from './MenuItem';

const propTypes = {
    ...menuItemPropTypes,
};

const MenuItemWithTopDescription = React.forwardRef((props, ref) => (
    <MenuItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldShowBasicTitle
        shouldShowDescriptionOnTop
    />
));

MenuItemWithTopDescription.propTypes = propTypes;
MenuItemWithTopDescription.displayName = 'MenuItemWithTopDescription';

export default MenuItemWithTopDescription;
