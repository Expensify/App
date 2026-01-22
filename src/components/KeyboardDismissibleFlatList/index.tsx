import type {ForwardedRef} from 'react';
import React from 'react';
import type {FlatList} from 'react-native';
import {useAnimatedScrollHandler, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import {useKeyboardDismissibleFlatListActions} from './KeyboardDismissibleFlatListContext';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, inverted, ...restProps}: AnimatedFlatListWithCellRendererProps<T>, ref: ForwardedRef<FlatList>) {
    const {onScroll: onScrollHandleKeyboard} = useKeyboardDismissibleFlatListActions();

    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true, inverted});

    const additionalOnScroll = useAnimatedScrollHandler({
        onScroll: emitComposerScrollEvents,
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

// eslint-disable-next-line no-restricted-syntax
export default React.forwardRef(KeyboardDismissibleFlatList);
