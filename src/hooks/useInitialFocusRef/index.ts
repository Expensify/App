import {useCallback, useRef} from 'react';
import useScreenInitialFocus from '@hooks/useScreenInitialFocus';
import isHTMLElement from '@libs/isHTMLElement';

/** Returns a ref-callback to attach to the element that should claim focus when its screen mounts (e.g. a back button on a screen header). */
function useInitialFocusRef(): (node: unknown) => void {
    const ref = useRef<HTMLElement | null>(null);
    const setRef = useCallback((node: unknown) => {
        ref.current = isHTMLElement(node) ? node : null;
    }, []);
    useScreenInitialFocus(ref);
    return setRef;
}

export default useInitialFocusRef;
