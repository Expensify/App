import isObject from 'lodash/isObject';
import {useEffect, useState} from 'react';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useMobileSelectionMode from './useMobileSelectionMode';
import useResponsiveLayout from './useResponsiveLayout';

type Option<TValue, TKey extends string | number> = Record<TKey, TValue>;

function isPendingValues<T>(option?: T) {
    if (isEmptyObject(option) || !isObject(option)) {
        return false;
    }
    return !('pendingAction' in option) || option?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function usePersistSelection<TValue, TKey extends string | number = string>(options: Option<TValue, TKey> | undefined, filterFn: (option?: TValue) => boolean = isPendingValues) {
    const [selectedOptions, setSelectedOptions] = useState<TKey[]>([]);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {selectionMode} = useMobileSelectionMode();

    const canSelectMultiple = isSmallScreenWidth ? selectionMode?.isEnabled : true;

    useEffect(() => {
        if (!canSelectMultiple) {
            return;
        }

        setSelectedOptions((prevOptions) => {
            const newSelectedOptions: TKey[] = [];
            prevOptions.forEach((key) => {
                if (!filterFn?.(options?.[key])) {
                    return;
                }
                newSelectedOptions.push(key);
            });

            return newSelectedOptions;
        });
    }, [options, canSelectMultiple, filterFn]);

    return [selectedOptions, setSelectedOptions] as const;
}

export default usePersistSelection;
