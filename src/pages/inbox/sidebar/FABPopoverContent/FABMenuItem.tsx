import {useLayoutEffect, useRef} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useFABMenuRegistryContext} from './FABMenuRegistryContext';

type FABMenuItemProps = PopoverMenuItem & {
    /** Unique stable ID for this item in the registry - use sentryLabel */
    registryId: string;
};

function FABMenuItem({registryId, ...item}: FABMenuItemProps) {
    const {registerItem, unregisterItem} = useFABMenuRegistryContext();
    const itemRef = useRef(item);
    itemRef.current = item;

    // Re-register on every render (overwrites with latest props)
    useLayoutEffect(() => {
        registerItem(registryId, itemRef.current);
    });

    // Unregister only on unmount
    useLayoutEffect(
        () => () => unregisterItem(registryId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return null;
}

export default FABMenuItem;
