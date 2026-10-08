import type {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

import {createContext} from 'react';

/** What a row hands to its list when it is touched, so the list-wide swipe knows which row to move */
type SwipeableListRow = {
    /** Unique within the list */
    key: string;

    leadingActionCount: number;
    trailingActionCount: number;

    /** Mounts the row's actions and attaches the swipe offset to it */
    activate: () => void;

    /** Unmounts the actions once the row is closed again */
    deactivate: () => void;

    /** Whether the row rests open with its actions showing */
    setIsOpen: (isOpen: boolean) => void;

    /** Runs the outermost action of a side after a full swipe */
    runPrimaryAction: (side: number) => void;
};

type SwipeableListContextValue = {
    /** Whether a screen reader is on; rows only build their accessibility actions then */
    isScreenReaderEnabled: boolean;

    /** Called on touch start by a row that can be swiped */
    registerTouch: (row: SwipeableListRow) => void;

    /** Springs the open row shut */
    closeActiveRow: () => void;

    /**
     * Ref callback the swiped or open row attaches to its container, so the list moves that one view natively.
     * Rows stay plain Views; only the active one is ever animated.
     */
    attachActiveRow: (view: View | null) => void;

    translateX: SharedValue<number>;
    armedProgress: SharedValue<number>;
    popScale: SharedValue<number>;
};

/**
 * One swipe gesture for a whole list. Rows own no gesture, shared values or animated styles; they only say "I was
 * touched", and the row being swiped borrows the list's offset until it is closed again.
 */
const SwipeableListContext = createContext<SwipeableListContextValue | undefined>(undefined);

export default SwipeableListContext;
export type {SwipeableListContextValue, SwipeableListRow};
