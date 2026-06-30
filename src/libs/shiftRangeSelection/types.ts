import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {GestureResponderEvent} from 'react-native';

type ShiftRangeBatch<TItem> = {
    toSelect: TItem[];
    toDeselect: TItem[];
};

/** Intersection with the event union lets native / RN-Web / DOM call sites pass their event without a cast. */
type ShiftClickEvent = (GestureResponderEvent | KeyboardEvent | ReactKeyboardEvent | MouseEvent) & {
    shiftKey?: boolean;
    nativeEvent?: {shiftKey?: boolean};
};

export type {ShiftRangeBatch, ShiftClickEvent};
