import {createContext, useContext} from 'react';

type FABMenuContextType = {
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    onItemPress: (onSelected: () => void, options?: {shouldCallAfterModalHide?: boolean}) => void;
    isVisible: boolean;
};

const FABMenuContext = createContext<FABMenuContextType>({
    focusedIndex: -1,
    setFocusedIndex: () => {},
    onItemPress: () => {},
    isVisible: false,
});

function useFABMenuContext() {
    return useContext(FABMenuContext);
}

export {FABMenuContext, useFABMenuContext};
export type {FABMenuContextType};
