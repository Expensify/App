import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

import type {TransactionListItemType} from './types';

/**
 * Publishes a group's lazily-loaded children to the shift-range source so shift+click can span them; `rangeChildren` must be
 * selection-independent so the payload is stable. Deliberately no effect cleanup — FlashList recycling must not drop an off-screen
 * expanded group from the range source; collapse unregisters explicitly (`shouldRegister` here, expanded-groups pruning in the split view).
 */
function useRegisterGroupChildrenForShiftRange(groupKey: string, rangeChildren: TransactionListItemType[], shouldRegister: boolean) {
    const {registerGroupChildren, unregisterGroupChildren} = useSearchShiftRangeChildren();
    useEffect(() => {
        if (!shouldRegister || rangeChildren.length === 0) {
            unregisterGroupChildren(groupKey);
            return;
        }
        registerGroupChildren(groupKey, rangeChildren);
    }, [shouldRegister, rangeChildren, groupKey, registerGroupChildren, unregisterGroupChildren]);
}

export default useRegisterGroupChildrenForShiftRange;
