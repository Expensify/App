import {createContext, useContext} from 'react';

/**
 * Interaction state of the menu item row, provided by `<MenuItem>` (the Root) and consumed by leaf
 * sub-components (e.g. `MenuItem.Icon` derives its fill color, `MenuItem.CopyButton` reveals itself on hover).
 */
type MenuItemState = {
    /** Whether the row is currently hovered */
    isHovered: boolean;

    /** Whether the row is currently pressed */
    isPressed: boolean;

    /** Whether the row is focused/active (the selected-row state, not screen focus) */
    isFocused: boolean;

    /** Whether the row is disabled */
    isDisabled: boolean;

    /** Whether the row responds to interactions */
    isInteractive: boolean;

    /** Whether the row uses success (green) styling */
    isSuccess: boolean;

    /** Whether the row is rendered inside a compact popover menu */
    isCompact: boolean;
};

const MenuItemContext = createContext<MenuItemState | undefined>(undefined);

function useMenuItemState(): MenuItemState {
    const state = useContext(MenuItemContext);
    if (!state) {
        throw new Error('MenuItem sub-components must be rendered inside <MenuItem>');
    }
    return state;
}

export default MenuItemContext;
export {useMenuItemState};
export type {MenuItemState};
