import {createContext, useContext} from 'react';

type FABMenuContextType = {
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    onItemPress: (onSelected: () => void, options?: {shouldCallAfterModalHide?: boolean}) => void;
    isVisible: boolean;
    registeredItems: readonly string[];
    registerItem: (id: string) => void;
    unregisterItem: (id: string) => void;
    shouldRedirectToExpensifyClassic: boolean;
    showRedirectToExpensifyClassicModal: () => Promise<void>;
};

const FABMenuContext = createContext<FABMenuContextType>({
    focusedIndex: -1,
    setFocusedIndex: () => {},
    onItemPress: () => {},
    isVisible: false,
    registeredItems: [],
    registerItem: () => {},
    unregisterItem: () => {},
    shouldRedirectToExpensifyClassic: false,
    showRedirectToExpensifyClassicModal: () => Promise.resolve(),
});

function useFABMenuContext() {
    return useContext(FABMenuContext);
}

export {FABMenuContext, useFABMenuContext};
export type {FABMenuContextType};
