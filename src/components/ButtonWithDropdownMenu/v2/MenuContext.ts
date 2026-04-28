import {createContext, use} from 'react';
import type {DropdownOptionV2Props, DropdownSubmenuV2Props} from './types';

type RegisteredOptionEntry = {
    id: string;
    kind: 'option';
    parentSubmenuId: string | undefined;
    position: number;
    props: DropdownOptionV2Props;
};

type RegisteredSubmenuEntry = {
    id: string;
    kind: 'submenu';
    parentSubmenuId: undefined;
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

/** Nearest enclosing `<Submenu>`'s id; descendant `<Option>`s scope to it. */
const SubmenuParentContext = createContext<string | undefined>(undefined);
SubmenuParentContext.displayName = 'ButtonWithDropdownMenuV2.SubmenuParentContext';

/** Render-order index so the registry sorts deterministically across conditional remounts. */
const PositionContext = createContext<number | undefined>(undefined);
PositionContext.displayName = 'ButtonWithDropdownMenuV2.PositionContext';

function useMenuRegistryActions(consumerName: string): MenuRegistryActions {
    const value = use(MenuRegistryActionsContext);
    if (!value) {
        throw new Error(`<${consumerName}> must be rendered inside <ButtonWithDropdownMenuV2.Menu>`);
    }
    return value;
}

function useSubmenuParentId(): string | undefined {
    return use(SubmenuParentContext);
}

function useChildPosition(consumerName: string): number {
    const value = use(PositionContext);
    if (value === undefined) {
        throw new Error(`<${consumerName}> must be rendered as a direct child of <ButtonWithDropdownMenuV2.Menu> or <ButtonWithDropdownMenuV2.Submenu>`);
    }
    return value;
}

function useAssertOutsideMenu(consumerName: string): void {
    const insideMenu = use(MenuRegistryActionsContext) !== null;
    if (process.env.NODE_ENV !== 'production' && insideMenu) {
        throw new Error(`<${consumerName}> must be a sibling of <Menu>, not a descendant.`);
    }
}

export {MenuRegistryActionsContext, PositionContext, SubmenuParentContext, useAssertOutsideMenu, useChildPosition, useMenuRegistryActions, useSubmenuParentId};
export type {MenuRegistryActions, RegisteredItemEntry, RegisteredOptionEntry, RegisteredSubmenuEntry};
