import {useState} from 'react';
import useScreenInitialFocus from '@hooks/useScreenInitialFocus';
import type {UseScreenInitialFocusOptions} from '@hooks/useScreenInitialFocus/types';
import isHTMLElement from '@libs/isHTMLElement';

/** Returns a ref-callback to attach to the element that should claim focus when its screen mounts (e.g. a back button on a screen header). Late attachment re-triggers the claim. */
function useInitialFocusRef(options?: UseScreenInitialFocusOptions): (node: unknown) => void {
    const [node, setNode] = useState<HTMLElement | null>(null);
    useScreenInitialFocus(node, options);
    return (newNode: unknown) => {
        const next = isHTMLElement(newNode) ? newNode : null;
        setNode((prev) => (prev === next ? prev : next));
    };
}

export default useInitialFocusRef;
