import union from 'lodash/union';
import {useMemo} from 'react';
import usePrevious from './usePrevious';

/** This hook provides a list of which keys changed in an object vs the previous render
 * akin to `sourceValue` for collections. Generally, using this hook at all is an anti-pattern.
 * Avoid it at all costs */
export default function useDiffPrevious<T extends Record<string, unknown>>(value: T): string[] {
    const previous = usePrevious(value);
    const diff = useMemo(() => {
        const allKeys = union(Object.keys(value), Object.keys(previous));
        return allKeys.filter((key) => value[key] !== previous[key]);
    }, [value, previous]);

    return diff;
}
