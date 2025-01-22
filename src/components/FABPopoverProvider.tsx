import type {ReactNode} from 'react';
import React, {createContext, useMemo, useState} from 'react';

type FABPopoverContextValue = {
    isCreateMenuActive: boolean;
    setIsCreateMenuActive: (value: boolean) => void;
};

const FABPopoverContext = createContext<FABPopoverContextValue>({
    isCreateMenuActive: false,
    setIsCreateMenuActive: () => {},
});

type FABPopoverProviderProps = {
    children: ReactNode;
};

function FABPopoverProvider({children}: FABPopoverProviderProps) {
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const value = useMemo(() => ({isCreateMenuActive, setIsCreateMenuActive}), [isCreateMenuActive]);
    return <FABPopoverContext.Provider value={value}>{children}</FABPopoverContext.Provider>;
}

export default FABPopoverProvider;
export {FABPopoverContext};
