import type {LegacyRef, MutableRefObject, RefCallback} from 'react';

/**
 * Assigns element reference to multiple refs.
 * @param refs The ref object or function arguments.
 */
export default function mergeRefs<T = unknown>(...refs: Array<MutableRefObject<T> | LegacyRef<T> | undefined | null>): RefCallback<T> {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                // eslint-disable-next-line no-param-reassign
                (ref as MutableRefObject<T | null>).current = value;
            }
        });
    };
}
