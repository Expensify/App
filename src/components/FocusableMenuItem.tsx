import React, {useRef} from 'react';
import type {View} from 'react-native';
import useSyncFocus from '@hooks/useSyncFocus';
import type {MenuItemProps} from './MenuItem';
import MenuItem from './MenuItem';

function FocusableMenuItem(props: MenuItemProps) {
    const ref = useRef<HTMLDivElement | View>(null);

    // Sync focus on an item
    useSyncFocus(ref, Boolean(props.focused));

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

FocusableMenuItem.displayName = 'FocusableMenuItem';

export default FocusableMenuItem;
