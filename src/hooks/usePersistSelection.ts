import isObject from 'lodash/isObject';
import {useEffect, useState} from 'react';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useMobileSelectionMode from './useMobileSelectionMode';
import useResponsiveLayout from './useResponsiveLayout';

type FilterOption<T> = Record<string | number, T>;

function isPendingValues<T>(option?: T) {
    if (isEmptyObject(option) || !isObject(option)) {
        return true;
    }
    return 'pendingAction' in option && option?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function usePersistSelection<T>(options: FilterOption<T> | undefined, filterFn: (option?: T) => boolean = isPendingValues) {
    const [selectedOptions, setSelectedOptions] = useState<FilterOption<boolean>>({});
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {selectionMode} = useMobileSelectionMode();

    const canSelectMultiple = isSmallScreenWidth ? selectionMode?.isEnabled : true;

    useEffect(() => {
        if (isEmptyObject(selectedOptions) || !canSelectMultiple) {
            return;
        }

        setSelectedOptions((prevOptions) => {
            const newSelectedOptions: FilterOption<boolean> = {};
            Object.keys(prevOptions ?? {}).forEach((key) => {
                if (!filterFn?.(options?.[key])) {
                    return;
                }
                newSelectedOptions[key] = prevOptions[key];
            });

            return newSelectedOptions;
        });

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [options]);

    return [selectedOptions, setSelectedOptions] as const;
}

export default usePersistSelection;
