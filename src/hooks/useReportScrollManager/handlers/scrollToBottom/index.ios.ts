import type {ScrollToBottomHandlerParams} from '@hooks/useReportScrollManager/types';

/**
 * The iOS interactive keyboard implementation uses the keyboard height in order
 * to animate the Report FlatList insets and offsets. This is to avoid content to be
 * covered by the keyboard when it is visible.
 * */

function scrollToBottomHandler({flatListRef, keyboardHeight, isKeyboardActive, setScrollPosition}: ScrollToBottomHandlerParams) {
    if (!flatListRef?.current) {
        return;
    }

    if (isKeyboardActive) {
        setScrollPosition({offset: -keyboardHeight});
        flatListRef.current?.scrollToOffset({animated: false, offset: -keyboardHeight});
        return;
    }

    setScrollPosition({offset: 0});

    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
}

export default scrollToBottomHandler;
