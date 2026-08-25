import {createContext, useContext} from 'react';

/** Config state of the menu item row */
type MenuItemConfig = {
    /** Whether the row is disabled */
    isDisabled: boolean;

    /** Whether the row responds to interactions */
    isInteractive: boolean;
};

/** Interaction state of the menu item row */
type MenuItemInteraction = {
    /** Whether the row is currently hovered */
    isHovered: boolean;

    /** Whether the row is currently pressed */
    isPressed: boolean;
};

const DEFAULT_CONFIG: MenuItemConfig = {
    isDisabled: false,
    isInteractive: false,
};

const DEFAULT_INTERACTION: MenuItemInteraction = {
    isHovered: false,
    isPressed: false,
};

const MenuItemConfigContext = createContext<MenuItemConfig | undefined>(undefined);
const MenuItemInteractionContext = createContext<MenuItemInteraction | undefined>(undefined);

function warnMissingProvider() {
    if (!__DEV__) {
        return;
    }
    console.error('MenuItem sub-components must be rendered inside <MenuItem.Root>');
}

function useMenuItemConfig(): MenuItemConfig {
    const state = useContext(MenuItemConfigContext);
    if (!state) {
        warnMissingProvider();
        return DEFAULT_CONFIG;
    }
    return state;
}

function useMenuItemInteraction(): MenuItemInteraction {
    const state = useContext(MenuItemInteractionContext);
    if (!state) {
        warnMissingProvider();
        return DEFAULT_INTERACTION;
    }
    return state;
}

export {MenuItemConfigContext, MenuItemInteractionContext, useMenuItemConfig, useMenuItemInteraction};
