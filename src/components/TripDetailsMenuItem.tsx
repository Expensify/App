import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {View} from 'react-native';
import MenuItem from './MenuItem';
import type {MenuItemProps} from './MenuItem';

function TripDetailsMenuItem(props: MenuItemProps, ref: ForwardedRef<View>) {
    return (
        <MenuItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            shouldShowBasicTitle
            shouldShowDescriptionOnTop
        />
    );
}

TripDetailsMenuItem.displayName = 'TripDetailsMenuItem';

export default forwardRef(TripDetailsMenuItem);