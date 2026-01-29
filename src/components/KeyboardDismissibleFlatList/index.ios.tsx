import {useEffect} from 'react';
import {useAnimatedProps, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import CONST from '@src/CONST';
import {useKeyboardDismissibleFlatListActions, useKeyboardDismissibleFlatListState} from './KeyboardDismissibleFlatListContext';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, ref, ...restProps}: AnimatedFlatListWithCellRendererProps<T>) {
    const {keyboardHeight, keyboardOffset} = useKeyboardDismissibleFlatListState();
    const {onScroll: onScrollHandleKeyboard, setListBehavior} = useKeyboardDismissibleFlatListActions();

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
        <AnimatedFlatListWithCellRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
            onScroll={onScroll}
            animatedProps={restProps.inverted ? invertedListAnimatedProps : regularListAnimatedProps}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
        />
    );
}

export default KeyboardDismissibleFlatList;
