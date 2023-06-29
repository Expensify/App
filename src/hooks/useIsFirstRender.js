import {useRef} from 'react';

/**
 * Utility hook to determine if the current render is the first render.
 *
 * @return {boolean}
 */
export default function useIsFirstRender() {
    const isFirst = useRef(true);

    if (isFirst.current) {
        isFirst.current = false;

        return true;
    }

    return isFirst.current;
}
