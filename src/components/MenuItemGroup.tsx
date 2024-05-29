import React, {createContext, useMemo} from 'react';
import useSingleExecution from '@hooks/useSingleExecution';
import type {Action} from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';

type MenuItemGroupContextProps = {
    isExecuting: boolean;
    singleExecution: <T extends unknown[]>(action: Action<T>) => (...params: T) => void;
    waitForNavigate: ReturnType<typeof useWaitForNavigation>;
};

const MenuItemGroupContext = createContext<MenuItemGroupContextProps | undefined>(undefined);

type MenuItemGroupProps = {
    /* Actual content wrapped by this component */
    children: React.ReactNode;

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution?: boolean;
};

function MenuItemGroup({children, shouldUseSingleExecution = true}: MenuItemGroupProps) {
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const value = useMemo(
        () => (shouldUseSingleExecution ? {isExecuting, singleExecution, waitForNavigate} : undefined),
        [shouldUseSingleExecution, isExecuting, singleExecution, waitForNavigate],
    );

    return <MenuItemGroupContext.Provider value={value}>{children}</MenuItemGroupContext.Provider>;
}

export {MenuItemGroupContext};
export default MenuItemGroup;
