import React from 'react';

import type {MenuItemProps} from './MenuItem';

import MenuItem from './MenuItem';

/** @deprecated Please use `MenuItemField` from `@components/MenuItem/presets/MenuItemField` for new usages. */
function MenuItemWithTopDescription({ref, ...props}: MenuItemProps) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- This deprecated wrapper is deleted together with legacy MenuItem.
        <MenuItem
            {...props}
            ref={ref}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
        />
    );
}

// eslint-disable-next-line @typescript-eslint/no-deprecated -- Exporting the deprecated component itself is not a usage.
export default MenuItemWithTopDescription;
