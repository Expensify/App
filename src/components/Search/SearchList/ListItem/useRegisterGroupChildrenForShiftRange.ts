import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

import type {TransactionListItemType} from './types';

/** Adds a group's children to the list a shift+click range spans. */
function useRegisterGroupChildrenForShiftRange(groupKey: string, rangeChildren: TransactionListItemType[], shouldRegister: boolean, shouldUnregisterOnUnmount: boolean) {
    const {registerGroupChildren, unregisterGroupChildren} = useSearchShiftRangeChildren();
    useEffect(() => {
        if (!shouldRegister || rangeChildren.length === 0) {
            unregisterGroupChildren(groupKey);
            return;
        }
        registerGroupChildren(groupKey, rangeChildren);
    }, [shouldRegister, rangeChildren, groupKey, registerGroupChildren, unregisterGroupChildren]);

    // Conditional because a row whose expanded state lives above it can unmount while the group is still open, and the owner prunes on collapse.
    useEffect(
        () => () => {
            if (!shouldUnregisterOnUnmount) {
                return;
            }
            unregisterGroupChildren(groupKey);
        },
        [shouldUnregisterOnUnmount, groupKey, unregisterGroupChildren],
    );
}

export default useRegisterGroupChildrenForShiftRange;
