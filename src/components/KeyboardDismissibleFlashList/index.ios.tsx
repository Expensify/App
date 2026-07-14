import type {AnimatedFlashListWithCellRendererProps} from '@components/AnimatedFlashListWithCellRenderer';
import AnimatedFlashListWithCellRenderer from '@components/AnimatedFlashListWithCellRenderer';

import CONST from '@src/CONST';

import {useEffect} from 'react';
import {useAnimatedProps, useComposedEventHandler} from 'react-native-reanimated';

import {useKeyboardDismissibleFlashListActions, useKeyboardDismissibleFlashListState} from './KeyboardDismissibleFlashListContext';

function KeyboardDismissibleFlashList<T>({onScroll: onScrollProp, ref, ...restProps}: AnimatedFlashListWithCellRendererProps<T>) {
    const {keyboardHeight, keyboardOffset} = useKeyboardDismissibleFlashListState();
    const {onScroll: onScrollHandleKeyboard, setListBehavior} = useKeyboardDismissibleFlashListActions();

    const onScroll = useComposedEventHandler([onScrollHandleKeyboard, onScrollProp ?? null]);

    const invertedListAnimatedProps = useAnimatedProps(() => {
        return {
            contentInset: {
                top: keyboardHeight.get(),
            },
            contentOffset: {
                x: 0,
                y: -keyboardHeight.get() + keyboardOffset.get(),
            },
        };
    });

    const regularListAnimatedProps = useAnimatedProps(() => {
        return {
            contentInset: {
                bottom: keyboardHeight.get(),
            },
            contentOffset: {
                x: 0,
                y: keyboardHeight.get() + keyboardOffset.get(),
            },
        };
    });

    useEffect(() => {
        setListBehavior(restProps.inverted ? CONST.LIST_BEHAVIOR.INVERTED : CONST.LIST_BEHAVIOR.REGULAR);
    }, [restProps.inverted, setListBehavior]);

    return (
        <AnimatedFlashListWithCellRenderer
            {...restProps}
            ref={ref}
            onScroll={onScroll}
            animatedProps={restProps.inverted ? invertedListAnimatedProps : regularListAnimatedProps}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
        />
    );
}

export default KeyboardDismissibleFlashList;
