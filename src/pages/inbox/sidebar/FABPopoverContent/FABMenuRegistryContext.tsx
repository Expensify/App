import {createContext, useContext} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';

type FABMenuRegistryContextType = {
    registerItem: (id: string, item: PopoverMenuItem) => void;
    unregisterItem: (id: string) => void;
};

const FABMenuRegistryContext = createContext<FABMenuRegistryContextType>({
    registerItem: () => {},
    unregisterItem: () => {},
});

function useFABMenuRegistryContext() {
    return useContext(FABMenuRegistryContext);
}

export {FABMenuRegistryContext, useFABMenuRegistryContext};
