import {useLayoutEffect} from 'react';
import {useFABMenuContext} from './FABMenuContext';

/**
 * Handles registration of a FAB menu item for arrow-key focus management.
 * Pass `isVisible` for items that conditionally render — registration mirrors visibility.
 * Returns the item's current index in the registered list (used for focus tracking).
 */
function useFABMenuItem(itemId: string, isVisible = true): number {
    const {registerItem, unregisterItem, registeredItems} = useFABMenuContext();

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        registerItem(itemId);
        return () => unregisterItem(itemId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    return registeredItems.indexOf(itemId);
}

export default useFABMenuItem;
