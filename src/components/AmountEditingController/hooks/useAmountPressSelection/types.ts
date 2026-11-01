import type {RefObject} from 'react';
import type {GestureResponderEvent} from 'react-native';

type AmountPressEvent = GestureResponderEvent | KeyboardEvent;

type AmountPressHandler = (event: AmountPressEvent) => void;

type UseAmountPressSelectionParams = {
    /** The controlled text input whose caret is read on press. */
    inputRef: RefObject<unknown>;

    /** Applies the caret offsets to the editing controller's selection. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Caller press handler, called after the selection sync. */
    onPress?: AmountPressHandler;
};

export type {AmountPressEvent, AmountPressHandler};
export default UseAmountPressSelectionParams;
