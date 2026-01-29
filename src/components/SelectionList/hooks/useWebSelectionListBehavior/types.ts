import type React from 'react';

type UseWebSelectionListBehaviorOptions = {
    /** Whether to track hover style state (only used by flat SelectionList) */
    shouldTrackHoverStyle?: boolean;

    /** Whether keyboard should be hidden on scroll */
    shouldHideKeyboardOnScroll?: boolean;
};

type UseWebSelectionListBehaviorResult = {
    /** Whether the current focus should be ignored (touch event on mobile chrome) */
    shouldIgnoreFocus: boolean;

    /** Whether scrolling should be debounced (during keyboard navigation) */
    shouldDebounceScrolling: boolean;

    /** Whether hover style should be disabled (only when shouldTrackHoverStyle is true) */
    shouldDisableHoverStyle: boolean;

    /** Setter for hover style state (only when shouldTrackHoverStyle is true) */
    setShouldDisableHoverStyle: React.Dispatch<React.SetStateAction<boolean>>;

    /** Callback to handle scroll events (dismisses keyboard on touch scroll) */
    onScroll: () => void;
};

export type {UseWebSelectionListBehaviorOptions, UseWebSelectionListBehaviorResult};
