import type {Ref, RefCallback, RefObject} from 'react';

/**
 * Assigns element reference to multiple refs. Forwards React 19 cleanup returns:
 * if any callback ref returns a cleanup function, mergeRefs returns one that
 * fans the unmount call out to every ref (calling each cleanup, or clearing
 * object refs and callback refs that didn't supply one).
 */
export default function mergeRefs<T = unknown>(...refs: Array<RefObject<T> | Ref<T> | undefined | null>): RefCallback<T> {
    return (value) => {
        const cleanups: Array<(() => void) | undefined> = [];
        let hasCleanup = false;
        for (const ref of refs) {
            if (typeof ref === 'function') {
                const result = ref(value);
                if (typeof result === 'function') {
                    cleanups.push(result);
                    hasCleanup = true;
                } else {
                    cleanups.push(undefined);
                }
            } else if (ref != null) {
                (ref as RefObject<T | null>).current = value;
                cleanups.push(undefined);
            } else {
                cleanups.push(undefined);
            }
        }
        if (!hasCleanup) {
            return undefined;
        }
        return () => {
            for (let index = 0; index < refs.length; index += 1) {
                const ref = refs.at(index);
                const cleanup = cleanups.at(index);
                if (cleanup) {
                    cleanup();
                } else if (typeof ref === 'function') {
                    ref(null);
                } else if (ref != null) {
                    (ref as RefObject<T | null>).current = null;
                }
            }
        };
    };
}
