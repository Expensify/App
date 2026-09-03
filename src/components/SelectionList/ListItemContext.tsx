import {createContext, useContext} from 'react';

type ListItemContextValue = {
    /**
     * Whether the row should render focus styling. True when the row is logically focused (keyboard index)
     * AND the highlight is allowed to show (initial highlight enabled or the user is keyboard-navigating),
     * so it can lag behind logical focus - see BaseSelectionList's isItemVisuallyFocused.
     */
    isFocusVisible: boolean;

    /** Whether text in the row should show a tooltip on overflow */
    shouldShowTooltip: boolean;

    /** Whether the row is disabled */
    isDisabled: boolean;

    /** Whether the row reacts to user interaction (item.isInteractive !== false) */
    isInteractive: boolean;

    /**
     * True when the row's pressable is not accessible as a single unit (accessible={false}), so the content
     * should group itself for screen readers and let separate right-side elements be focused independently.
     */
    shouldDisableAccessibleGrouping: boolean;
};

const ListItemContext = createContext<ListItemContextValue>({
    isFocusVisible: false,
    shouldShowTooltip: false,
    isDisabled: false,
    isInteractive: true,
    shouldDisableAccessibleGrouping: false,
});

/**
 * Whether the row should render hover styling: the pointer is hovering the row's pressable (always false on
 * devices without hover support) and hover styling is not disabled for the row (shouldDisableHoverStyle).
 * Separate from ListItemContext for perf.
 */
const ListItemHoverContext = createContext<boolean>(false);

function useListItemContext() {
    return useContext(ListItemContext);
}

function useListItemHovered() {
    return useContext(ListItemHoverContext);
}

export {ListItemContext, ListItemHoverContext, useListItemContext, useListItemHovered};
