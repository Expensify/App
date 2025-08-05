import type {ForwardedRef} from 'react';
import {forwardRef} from 'react';
import type {FlatList} from 'react-native';
import {useAnimatedProps} from 'react-native-reanimated';
import type {CustomAnimatedFlatListProps} from '@components/CustomAnimatedFlatList';
import CustomAnimatedFlatList from '@components/CustomAnimatedFlatList';
import {useKeyboardDismissableFlatListContext} from './KeyboardDismissableFlatListContext';

function KeyboardDismissableFlatList<T>(props: CustomAnimatedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {keyboardHeight, keyboardOffset, onScroll} = useKeyboardDismissableFlatListContext();

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
        };
    });

    return (
        <CustomAnimatedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            animatedProps={props.inverted ? invertedListAnimatedProps : regularListAnimatedProps}
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            onScroll={onScroll}
        />
    );
}

export default forwardRef(KeyboardDismissableFlatList);
