import type {ScrollToOffsetHandlerParams} from '@hooks/useReportScrollManager/types';

/**
 * The iOS interactive keyboard implementation uses the keyboard height in order
 * to animate the Report FlatList insets and offsets. This is to avoid content to be
 * covered by the keyboard when it is visible.
 * */

function scrollToOffsetHandler({listRef, offset, isKeyboardActive, keyboardHeight}: ScrollToOffsetHandlerParams) {
    if (!listRef?.current) {
        return;
    }

    if (isKeyboardActive) {
        listRef.current?.scrollToOffset({animated: false, offset: offset - keyboardHeight});
        return;
    }

    listRef.current.scrollToOffset({offset, animated: false});
}

export default scrollToOffsetHandler;
