import {useState} from 'react';
import useScreenInitialFocus from '@hooks/useScreenInitialFocus';
import type {UseScreenInitialFocusOptions} from '@hooks/useScreenInitialFocus/types';
import isHTMLElement from '@libs/isHTMLElement';

/** Returns a ref-callback for the element that should claim focus once its screen has mounted. Late attachment re-triggers the claim. */
function useInitialFocusRef(options?: UseScreenInitialFocusOptions): (node: unknown) => void {
    const [node, setNode] = useState<HTMLElement | null>(null);
    useScreenInitialFocus(node, options);
    return (newNode: unknown) => {
        const next = isHTMLElement(newNode) ? newNode : null;
        setNode((prev) => (prev === next ? prev : next));
    };
}

export default useInitialFocusRef;
