import React, {useLayoutEffect, useRef} from 'react';
import type {View} from 'react-native';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

function PopoverMenuItem(props: MenuItemProps) {
    const ref = useRef<View>(null);

    // Sync focus on an item
    useLayoutEffect(() => {
        if (!props.focused) {
            return;
        }

        ref?.current?.focus();
    }, [props.focused]);

    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

PopoverMenuItem.displayName = 'PopoverMenuItem';

export default PopoverMenuItem;
