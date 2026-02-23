import React, {useCallback, useRef} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {FABMenuRegistryContext} from './FABMenuRegistryContext';

type FABMenuRegistryProps = {
    children: React.ReactNode;
    onItemsChange: (items: PopoverMenuItem[]) => void;
};

function FABMenuRegistry({children, onItemsChange}: FABMenuRegistryProps) {
    const orderedIdsRef = useRef<string[]>([]);
    const itemsMapRef = useRef<Map<string, PopoverMenuItem>>(new Map());

    const registerItem = useCallback(
        (id: string, item: PopoverMenuItem) => {
            if (!orderedIdsRef.current.includes(id)) {
                orderedIdsRef.current = [...orderedIdsRef.current, id];
            }
            itemsMapRef.current.set(id, item);
            onItemsChange(orderedIdsRef.current.map((i) => itemsMapRef.current.get(i)).filter(Boolean) as PopoverMenuItem[]);
        },
        [onItemsChange],
    );

    const unregisterItem = useCallback(
        (id: string) => {
            orderedIdsRef.current = orderedIdsRef.current.filter((i) => i !== id);
            itemsMapRef.current.delete(id);
            onItemsChange(orderedIdsRef.current.map((i) => itemsMapRef.current.get(i)).filter(Boolean) as PopoverMenuItem[]);
        },
        [onItemsChange],
    );

    return <FABMenuRegistryContext.Provider value={{registerItem, unregisterItem}}>{children}</FABMenuRegistryContext.Provider>;
}

export default FABMenuRegistry;
