import type {RefObject} from 'react';
import type {GestureResponderEvent} from 'react-native';

type NumericPressEvent = GestureResponderEvent | KeyboardEvent;

type NumericPressHandler = (event: NumericPressEvent) => void;

type UseNumericPressSelectionParams = {
    /** The controlled text input whose caret is read on press. */
    inputRef: RefObject<unknown>;

    /** Applies the caret offsets to the editing controller's selection. */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Caller press handler, called after the selection sync. */
    onPress?: NumericPressHandler;
};

export type {NumericPressEvent, NumericPressHandler};
export default UseNumericPressSelectionParams;
