import type {ForwardedRef} from 'react';
import {forwardRef, useEffect} from 'react';
import type {FlatList} from 'react-native';
import {useAnimatedProps, useAnimatedScrollHandler, useComposedEventHandler} from 'react-native-reanimated';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';
import AnimatedFlatListWithCellRenderer from '@components/AnimatedFlatListWithCellRenderer';
import useKeyboardDismissibleFlatListValues from './useKeyboardDismissibleFlatListValues';

function KeyboardDismissibleFlatList<T>({onScroll: onScrollProp, regularOnScrollHandler, ...restProps}: AnimatedFlatListWithCellRendererProps<T>, ref: ForwardedRef<FlatList>) {
    const {keyboardHeight, keyboardOffset, onScroll: onScrollHandleKeyboard, setListBehavior} = useKeyboardDismissibleFlatListValues();

    const additionalOnScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            regularOnScrollHandler?.(event);
        },
    });

    const onScroll = useComposedEventHandler([onScrollHandleKeyboard, additionalOnScroll, onScrollProp ?? null]);

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
        setListBehavior(restProps.inverted ? 'inverted' : 'regular');
    }, [restProps.inverted, setListBehavior]);

    return (
        <AnimatedFlatListWithCellRenderer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
            animatedProps={restProps.inverted ? invertedListAnimatedProps : regularListAnimatedProps}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            onScroll={onScroll}
        />
    );
}

export default forwardRef(KeyboardDismissibleFlatList);
