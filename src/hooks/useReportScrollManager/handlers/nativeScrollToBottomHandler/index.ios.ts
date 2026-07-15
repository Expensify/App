import type NativeScrollToBottomHandler from './types';

/**
 * The iOS interactive keyboard implementation uses the keyboard height in order
 * to animate the Report FlatList insets and offsets. This is to avoid content to be
 * covered by the keyboard when it is visible.
 * */

const nativeScrollToBottomHandler: NativeScrollToBottomHandler = ({listRef, keyboardHeight, isKeyboardActive}) => {
    if (!listRef?.current) {
        return;
    }

    if (isKeyboardActive) {
        listRef.current?.scrollToOffset({animated: false, offset: -keyboardHeight});
        return;
    }

    listRef.current.scrollToOffset({animated: false, offset: 0});
};

export default nativeScrollToBottomHandler;
