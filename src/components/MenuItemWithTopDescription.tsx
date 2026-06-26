import React from 'react';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

function MenuItemWithTopDescription({outerWrapperStyle, ref, ...props}: MenuItemProps) {
    return (
        <MenuItem
            {...props}
            ref={ref}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
            outerWrapperStyle={outerWrapperStyle}
        />
    );
}

export default MenuItemWithTopDescription;
