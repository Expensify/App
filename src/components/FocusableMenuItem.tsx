import useSyncFocus from '@hooks/useSyncFocus';

import type {View} from 'react-native';

import React, {useRef} from 'react';

import type {MenuItemProps} from './MenuItem';

import MenuItem from './MenuItem';

type FocusableMenuItemProps = MenuItemProps & {
    /** Whether keyboard focus should follow the visual focused state */
    shouldSyncFocus?: boolean;
};

function FocusableMenuItem({shouldSyncFocus = true, ...props}: FocusableMenuItemProps) {
    const ref = useRef<View>(null);

    // Sync focus on an item
    useSyncFocus(ref, !!props.focused, shouldSyncFocus);

    return (
        <MenuItem
            {...props}
            ref={ref}
        />
    );
}

export default FocusableMenuItem;
