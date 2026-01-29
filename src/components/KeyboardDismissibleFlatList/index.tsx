import React from 'react';
import {useAnimatedScrollHandler, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import {useKeyboardDismissibleFlatListActions} from './KeyboardDismissibleFlatListContext';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, inverted, ref, ...restProps}: AnimatedFlatListWithCellRendererProps<T>) {
    const {onScroll: onScrollHandleKeyboard} = useKeyboardDismissibleFlatListActions();

    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true, inverted});

    const additionalOnScroll = useAnimatedScrollHandler({
        onScroll: () => {
            'worklet';

            emitComposerScrollEvents();
        },
    });

    const onScroll = useComposedEventHandler([onScrollHandleKeyboard, additionalOnScroll, onScrollProp ?? null]);

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
