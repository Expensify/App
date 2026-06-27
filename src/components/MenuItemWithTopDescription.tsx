import React from 'react';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

function MenuItemWithTopDescription({ref, ...props}: MenuItemProps) {
    return (
        <MenuItem
            {...props}
            ref={ref}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
        />
    );
}

export default MenuItemWithTopDescription;
