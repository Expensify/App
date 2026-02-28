import type {Ref, RefCallback, RefObject} from 'react';

/**
 * Assigns element reference to multiple refs.
 * @param refs The ref object or function arguments.
 */
export default function mergeRefs<T = unknown>(...refs: Array<RefObject<T> | Ref<T> | undefined | null>): RefCallback<T> {
    return (value) => {
        for (const ref of refs) {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                // eslint-disable-next-line no-param-reassign
                (ref as RefObject<T | null>).current = value;
            }
        }
    };
}
