import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {GestureResponderEvent} from 'react-native';

/** Keys pressed during a click — shift extends the range, additive stacks ranges (Cmd on Mac, Ctrl elsewhere). */
type Modifiers = {shiftKey: boolean; additive: boolean};

/** Atomic batch the hook emits when shift+click changes the selection. */
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
