import React from 'react';
import type {FocusEventHandler} from 'react';
import {View} from 'react-native';
import type {CellRendererProps} from 'react-native';
import type {ListItem} from '@components/SelectionList/types';

function FocusAwareCellRendererComponent<TItem extends ListItem>({onFocusCapture, ...rest}: CellRendererProps<TItem>) {
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            // Forward bubbled events to VirtualizedList's captured handler which is not supported on web platforms.
            onFocus={onFocusCapture as unknown as FocusEventHandler | undefined}
        />
    );
}

FocusAwareCellRendererComponent.displayName = 'FocusAwareCellRendererComponent';

export default FocusAwareCellRendererComponent;
