import type {ScrollToOffsetHandlerParams} from '@hooks/useReportScrollManager/types';

/**
 * The iOS interactive keyboard implementation uses the keyboard height in order
 * to animate the Report FlatList insets and offsets. This is to avoid content to be
 * covered by the keyboard when it is visible.
 * */

function scrollToOffsetHandler({flatListRef, offset, isKeyboardActive, keyboardHeight}: ScrollToOffsetHandlerParams) {
    if (!flatListRef?.current) {
        return;
    }

    if (isKeyboardActive) {
        flatListRef.current?.scrollToOffset({animated: false, offset: offset - keyboardHeight});
        return;
    }

    flatListRef.current.scrollToOffset({offset, animated: false});
}

export default scrollToOffsetHandler;
