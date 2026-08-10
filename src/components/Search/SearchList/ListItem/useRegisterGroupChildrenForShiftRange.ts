import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

import type {TransactionListItemType} from './types';

/**
 * Adds a group's children to the list that shift+click ranges over, so a range can span them.
 * Pass `shouldUnregisterOnUnmount` when this component holds the group's expanded state, so the children go away with it. Leave it off when
 * that state lives higher up: the row can unmount while the group is still expanded, and the owner removes the children on collapse instead.
 */
function useRegisterGroupChildrenForShiftRange(groupKey: string, rangeChildren: TransactionListItemType[], shouldRegister: boolean, shouldUnregisterOnUnmount: boolean) {
    const {registerGroupChildren, unregisterGroupChildren} = useSearchShiftRangeChildren();
    useEffect(() => {
        if (!shouldRegister || rangeChildren.length === 0) {
            unregisterGroupChildren(groupKey);
            return;
        }
        registerGroupChildren(groupKey, rangeChildren);
    }, [shouldRegister, rangeChildren, groupKey, registerGroupChildren, unregisterGroupChildren]);

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
