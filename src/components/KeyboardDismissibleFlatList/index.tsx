import React from 'react';
import {useAnimatedScrollHandler, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import useKeyboardDismissibleFlatListValues from './useKeyboardDismissibleFlatListValues';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, inverted, ref, ...restProps}: AnimatedFlatListWithCellRendererProps<T>) {
    const {onScroll: onScrollHandleKeyboard} = useKeyboardDismissibleFlatListValues();

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

export default KeyboardDismissibleFlatList;
