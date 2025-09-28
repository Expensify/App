import type {ForwardedRef} from 'react';
import React from 'react';
import type {FlatList} from 'react-native';
import {useAnimatedScrollHandler, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import useKeyboardDismissibleFlatListValues from './useKeyboardDismissibleFlatListValues';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, additionalOnScrollHandler, ...restProps}: AnimatedFlatListWithCellRendererProps<T>, ref: ForwardedRef<FlatList>) {
    const {onScroll: onScrollHandleKeyboard} = useKeyboardDismissibleFlatListValues();

    const additionalOnScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            additionalOnScrollHandler?.(event);
        },
    });

    const onScroll = useComposedEventHandler([onScrollHandleKeyboard, additionalOnScroll, onScrollProp ?? null]);

    return (
        <AnimatedFlatListWithCellRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
            onScroll={onScroll}
        />
    );
}

export default React.forwardRef(KeyboardDismissibleFlatList);
