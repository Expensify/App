import React from 'react';
import menuItemPropTypes from './menuItemPropTypes';
import MenuItem from './MenuItem';

const propTypes = {
    ...menuItemPropTypes,
};

const MenuItemWithTopDescription = props => (
    <MenuItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        shouldShowBasicTitle
        shouldShowDescriptionOnTop
    />
);

MenuItemWithTopDescription.propTypes = propTypes;
MenuItemWithTopDescription.displayName = 'MenuItemWithTopDescription';

export default MenuItemWithTopDescription;
