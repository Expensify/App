import {createContext, use} from 'react';
import type {DropdownOptionV2Props, DropdownSubmenuV2Props} from './types';

type RegisteredOptionEntry = {
    id: string;
    kind: 'option';
    parentSubmenuID: string | undefined;
    position: number;
    props: DropdownOptionV2Props;
};

type RegisteredSubmenuEntry = {
    id: string;
    kind: 'submenu';
    parentSubmenuID: undefined;
    position: number;
    props: DropdownSubmenuV2Props;
};

type RegisteredItemEntry = RegisteredOptionEntry | RegisteredSubmenuEntry;

type MenuRegistryActions = {
    registerItem: (entry: RegisteredItemEntry) => void;
    unregisterItem: (id: string) => void;
};

const MenuRegistryActionsContext = createContext<MenuRegistryActions | null>(null);
MenuRegistryActionsContext.displayName = 'ButtonWithDropdownMenuV2.MenuRegistryActionsContext';

function useMenuRegistryActions(consumerName: string): MenuRegistryActions {
    const value = use(MenuRegistryActionsContext);
    if (!value) {
        throw new Error(`<${consumerName}> must be rendered inside <ButtonWithDropdownMenuV2.Menu>`);
    }
    return value;
}

function useAssertOutsideMenu(consumerName: string): void {
    const insideMenu = use(MenuRegistryActionsContext) !== null;
    if (process.env.NODE_ENV !== 'production' && insideMenu) {
        throw new Error(`<${consumerName}> must be a sibling of <Menu>, not a descendant.`);
    }
}

export {MenuRegistryActionsContext, useAssertOutsideMenu, useMenuRegistryActions};
export type {MenuRegistryActions, RegisteredItemEntry, RegisteredOptionEntry, RegisteredSubmenuEntry};
