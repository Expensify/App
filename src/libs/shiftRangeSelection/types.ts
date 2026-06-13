import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {GestureResponderEvent} from 'react-native';

type Modifiers = {shiftKey: boolean};

type ShiftRangeBatch<TItem> = {
    toSelect: TItem[];
    toDeselect: TItem[];
};

/** Intersection with the event union lets native / RN-Web / DOM call sites pass their event without a cast. */
type ModifierEvent = (GestureResponderEvent | KeyboardEvent | ReactKeyboardEvent | MouseEvent) & {
    shiftKey?: boolean;
    metaKey?: boolean;
    ctrlKey?: boolean;
    nativeEvent?: {shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean};
};

export type {Modifiers, ShiftRangeBatch, ModifierEvent};
