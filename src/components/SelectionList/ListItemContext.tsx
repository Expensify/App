import {createContext, useContext} from 'react';

type ListItemContextValue = {
    /**
     * Whether the row is logically focused (keyboard index). Legacy providers (UserListItemContent,
     * InviteMemberListItem) set only this; ListItemPressable provides both this and isFocusVisible.
     */
    isFocused?: boolean;

    /**
     * Whether the row should render focus styling. True when the row is logically focused (keyboard index)
     * AND the highlight is allowed to show (initial highlight enabled or the user is keyboard-navigating),
     * so it can lag behind logical focus - see BaseSelectionList's isItemVisuallyFocused.
     */
    isFocusVisible?: boolean;

    /** Whether text in the row should show a tooltip on overflow */
    shouldShowTooltip?: boolean;
};

const ListItemContext = createContext<ListItemContextValue>({isFocused: false, isFocusVisible: false, shouldShowTooltip: false});

/**
 * Whether the pointer is hovering the row's pressable (always false on devices without hover support).
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
