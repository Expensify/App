import type {ScrollToBottomHandlerParams} from '@hooks/useReportScrollManager/types';

/**
 * The iOS interactive keyboard implementation uses the keyboard height in order
 * to animate the Report FlatList insets and offsets. This is to avoid content to be
 * covered by the keyboard when it is visible.
 * */

function scrollToBottomHandler({flatListRef, keyboardHeight, isKeyboardActive, scrollPositionRef}: ScrollToBottomHandlerParams) {
    if (!flatListRef?.current) {
        return;
    }

    if (isKeyboardActive) {
        // eslint-disable-next-line no-param-reassign
        scrollPositionRef.current = {offset: -keyboardHeight};
        flatListRef.current?.scrollToOffset({animated: false, offset: -keyboardHeight});
        return;
    }

    // eslint-disable-next-line no-param-reassign
    scrollPositionRef.current = {offset: 0};

    flatListRef.current?.scrollToOffset({animated: false, offset: 0});
}

export default scrollToBottomHandler;
