import React, {createContext, useContext} from 'react';
import useSingleExecution from '@hooks/useSingleExecution';
import type {Action} from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';

type MenuItemGroupStateContextProps = {
    isExecuting: boolean;
};

type MenuItemGroupActionsContextProps = {
    singleExecution: <T extends unknown[]>(action: Action<T>) => (...params: T) => void;
    waitForNavigate: ReturnType<typeof useWaitForNavigation>;
};

const MenuItemGroupStateContext = createContext<MenuItemGroupStateContextProps | null>(null);
const MenuItemGroupActionsContext = createContext<MenuItemGroupActionsContextProps | null>(null);

type MenuItemGroupProps = {
    /* Actual content wrapped by this component */
    children: React.ReactNode;

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution?: boolean;
};

function MenuItemGroup({children, shouldUseSingleExecution = true}: MenuItemGroupProps) {
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const stateValue = shouldUseSingleExecution ? {isExecuting} : null;
    const actionsValue = shouldUseSingleExecution ? {singleExecution, waitForNavigate} : null;

    return (
        <MenuItemGroupStateContext.Provider value={stateValue}>
            <MenuItemGroupActionsContext.Provider value={actionsValue}>{children}</MenuItemGroupActionsContext.Provider>
        </MenuItemGroupStateContext.Provider>
    );
}

function useMenuItemGroupState() {
    return useContext(MenuItemGroupStateContext);
}

function useMenuItemGroupActions() {
    return useContext(MenuItemGroupActionsContext);
}

export {useMenuItemGroupState, useMenuItemGroupActions};
export default MenuItemGroup;
