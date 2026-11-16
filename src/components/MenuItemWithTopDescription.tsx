import React from 'react';

import type {MenuItemProps} from './MenuItem';

import MenuItem from './MenuItem';

/** @deprecated Use `MenuItemField` from `@components/MenuItem/presets/MenuItemField` for new usages. */
function MenuItemWithTopDescription({ref, ...props}: MenuItemProps) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- The deprecated wrapper itself must render legacy MenuItem.
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
