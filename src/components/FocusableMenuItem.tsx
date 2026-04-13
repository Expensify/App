import React, {useRef} from 'react';
import type {View} from 'react-native';
import useSyncFocus from '@hooks/useSyncFocus';
import mergeRefs from '@libs/mergeRefs';
import type {MenuItemProps} from './MenuItem';
import MenuItem from './MenuItem';

function FocusableMenuItem({ref: forwardedRef, ...props}: MenuItemProps) {
    const internalRef = useRef<View>(null);

    // Sync focus on an item
    useSyncFocus(internalRef, !!props.focused);

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={mergeRefs(internalRef, forwardedRef)}
        />
    );
}

export default FocusableMenuItem;
