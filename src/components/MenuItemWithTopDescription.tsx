import React from 'react';

import type {MenuItemProps} from './MenuItem';

import MenuItem from './MenuItem';

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
