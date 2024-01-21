import React, {createContext} from 'react';
import useSingleExecution from '@hooks/useSingleExecution';
import type {Action} from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';

type MenuItemGroupContextProps = {
    isExecuting: boolean;
    singleExecution: <T extends unknown[]>(action?: Action<T> | undefined) => (...params: T) => void;
    waitForNavigate: ReturnType<typeof useWaitForNavigation>;
};

const MenuItemGroupContext = createContext<MenuItemGroupContextProps | undefined>(undefined);

interface MenuItemGroupProps {
    /* Actual content wrapped by this component */
    children: React.ReactNode;

    /** Whether or not to use the single execution hook */
    shouldUseSingleExecution: boolean;
}

const MenuItemGroup: React.FC<MenuItemGroupProps> = ({children}) => {
    const {isExecuting, singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    return <MenuItemGroupContext.Provider value={{isExecuting, singleExecution, waitForNavigate}}>{children}</MenuItemGroupContext.Provider>;
};

export {MenuItemGroupContext};
export default MenuItemGroup;
