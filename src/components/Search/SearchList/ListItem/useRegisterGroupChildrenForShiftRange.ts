import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

import type {TransactionListItemType} from './types';

/** Publishes a group's children so a shift+click range can span them. Nothing is withdrawn on unmount, since openness decides their reach and outlives any one row. */
function useRegisterGroupChildrenForShiftRange(groupKey: string, rangeChildren: TransactionListItemType[], shouldRegister: boolean) {
    const {registerGroupChildren, registryGeneration} = useSearchShiftRangeChildren();
    // `registryGeneration` is a dependency and nothing else: republishing is what it changing means.
    useEffect(() => {
        if (!shouldRegister) {
            return;
        }
        registerGroupChildren(groupKey, rangeChildren);
    }, [shouldRegister, rangeChildren, groupKey, registerGroupChildren, registryGeneration]);
}

export default useRegisterGroupChildrenForShiftRange;
