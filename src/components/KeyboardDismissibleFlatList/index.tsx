import React from 'react';
import {useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import {useKeyboardDismissibleFlatListActions} from './KeyboardDismissibleFlatListContext';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, inverted, ref, ...restProps}: AnimatedFlatListWithCellRendererProps<T>) {
    const {onScroll: onScrollHandleKeyboard} = useKeyboardDismissibleFlatListActions();

    const onScroll = useComposedEventHandler([onScrollHandleKeyboard, onScrollProp ?? null]);

    return (
        <AnimatedFlatListWithCellRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted={inverted}
            ref={ref}
            onScroll={onScroll}
        />
    );
}

export default KeyboardDismissibleFlatList;
