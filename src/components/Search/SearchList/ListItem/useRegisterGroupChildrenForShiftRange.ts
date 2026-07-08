import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

import type {TransactionListItemType} from './types';

/**
 * Publishes a group's lazily-loaded children to the shift-range source so shift+click can span them. Called by both grouped render paths
 * (split `GroupChildrenContent` and inline `TransactionGroupListItem`); `rangeChildren` must be selection-independent so the payload is stable.
 */
function useRegisterGroupChildrenForShiftRange(groupKey: string, rangeChildren: TransactionListItemType[], shouldRegister: boolean) {
    const {registerGroupChildren, unregisterGroupChildren} = useSearchShiftRangeChildren();
    useEffect(() => {
        if (!shouldRegister || rangeChildren.length === 0) {
            unregisterGroupChildren(groupKey);
            return;
        }
        registerGroupChildren(groupKey, rangeChildren);
        return () => unregisterGroupChildren(groupKey);
    }, [shouldRegister, rangeChildren, groupKey, registerGroupChildren, unregisterGroupChildren]);
}

export default useRegisterGroupChildrenForShiftRange;
